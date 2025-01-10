import { aliasedTable, and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clickUpUser, tickets } from "~/server/db/schema";
import { getUserConfigs, type UserConfigsType } from "./clickUpConfig";
import { env } from "~/env";
import { createError } from "~/lib/error-helpers";

const createTicketSchema = z.object({
  card: z.string(),
  b1Id: z.number().optional().nullable(),
  b2Id: z.number().optional().nullable(),
  shouldCreateALinkedCard: z.boolean().optional(),
});
const updateTicketSchema = createTicketSchema.and(
  z.object({ ticketId: z.number() }),
);

type createTicketType = z.infer<typeof createTicketSchema>;

async function getErrorFromClickupApi(r: Response) {
  return (await r.json()) as { err: string; ECODE: string };
}

async function setClickupCardCustomField({
  taskId,
  fieldId,
  token,
  addValue,
  remValue,
}: {
  taskId: string;
  fieldId: string;
  token: string;
  addValue?: number;
  remValue?: number;
}) {
  const value: {
    add?: number[];
    rem?: number[];
  } = {};
  if (addValue) {
    value.add = [addValue];
  }

  if (remValue) {
    value.rem = [remValue];
  }

  try {
    const r = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}/field/${fieldId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ value }),
      },
    );

    if (r.ok === false) {
      const erro = await getErrorFromClickupApi(r);

      throw new Error(
        `Erro ao tentar atualizar campo customizado. Verifique suas configurações, e tente novamente. \n\n Detalhes: ${erro.err}`,
      );
    }
  } catch (e) {
    throw createError({
      code: "PRECONDITION_FAILED",
      message: e instanceof Error ? e.message : JSON.stringify(e),
    });
  }
}

function getClickUpCard({
  cardId,
  clickUpConfig,
}: {
  cardId: string;
  clickUpConfig: UserConfigsType;
}) {
  return fetch(`https://api.clickup.com/api/v2/task/${cardId}`, {
    method: "GET",
    headers: {
      Authorization: clickUpConfig.decriptedToken,
    },
  }).then(async (response): Promise<unknown> => {
    if (response.ok === false) {
      const erro = await getErrorFromClickupApi(response);
      throw createError({
        code: "PRECONDITION_FAILED",
        message: `Erro ao tentar buscar o card no clickup. \n\nDetalhes: ${erro.err}`,
      });
    }

    return response.json();
  }) as Promise<{ name?: string }>;
}

function getClickupCardId(url: string) {
  const splittedCard = url?.split?.("/");
  const cardId = splittedCard?.[splittedCard?.length - 1];

  return cardId;
}

function getPaginationParams({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const limit = pageSize;
  const offset = pageSize * (page ? page - 1 : 0);

  return {
    limit,
    offset,
  };
}

export const ticketRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const { card, b1Id, b2Id, shouldCreateALinkedCard } = input;

      const clickUpConfig = await getUserConfigs({ ctx });
      const cardId = getClickupCardId(card);
      if (!cardId) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message:
            'Link mal formatado. O formato esperado é "https://app.clickup.com/t/{identificador do card}"',
        });
      }

      const cardName = (await getClickUpCard({ cardId, clickUpConfig })).name;

      if (!cardName) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message:
            "Erro ao buscar nome do card. Verifique o link enviado e tente novamente.",
        });
      }
      const newTicket: createTicketType & {
        b1UpdatedAt?: Date;
        b2UpdatedAt?: Date;
        createdById: string;
        company: string;
        cardName: string;
        linkedCard?: string;
      } = {
        createdById: ctx.session.user.id,
        card,
        company: env.COMPANY,
        cardName,
      };

      if (shouldCreateALinkedCard) {
        if (!clickUpConfig?.linkedTicketListId) {
          throw createError({
            code: "PRECONDITION_FAILED",
            message:
              "Configuração do identificador da lista de cards linkado não encontrada. Adicione o identificador nas configurações e tente novamente",
          });
        }
        const { url } = (await fetch(
          `https://api.clickup.com/api/v2/list/${clickUpConfig.linkedTicketListId}/task`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: clickUpConfig.decriptedToken,
            },
            body: JSON.stringify({
              name: cardName,
            }),
          },
        ).then(async (response): Promise<unknown> => {
          if (response.ok === false) {
            const erro = await getErrorFromClickupApi(response);
            throw createError({
              code: "PRECONDITION_FAILED",
              message: `Erro ao tentar buscar o criar card linkado no clickup. \n\nDetalhes: ${erro.err}`,
            });
          }

          return response.json();
        })) as { url?: string };

        if (!url) {
          throw createError({
            code: "PRECONDITION_FAILED",
            message: `Erro ao criar card linkado no clickup. \n\nDetalhes: Não recebemos a url do novo card`,
          });
        }

        newTicket.linkedCard = url;
      }

      newTicket.b1Id = b1Id;
      if (b1Id) {
        newTicket.b1UpdatedAt = new Date();
      }
      newTicket.b2Id = b2Id;
      if (b2Id) {
        newTicket.b2UpdatedAt = new Date();
      }

      if (b1Id) {
        await setClickupCardCustomField({
          fieldId: clickUpConfig?.B1UUID,
          taskId: getClickupCardId(card)!,
          token: clickUpConfig.decriptedToken,
          addValue: b1Id,
        });
      }

      if (b2Id) {
        await setClickupCardCustomField({
          fieldId: clickUpConfig.B2UUID,
          taskId: getClickupCardId(card)!,
          token: clickUpConfig.decriptedToken,
          addValue: b2Id,
        });
      }

      await ctx.db.insert(tickets).values(newTicket);
    }),
  update: protectedProcedure
    .input(updateTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const { card, b1Id, b2Id, ticketId } = input;
      const oldTicket = await ctx.db.query.tickets.findFirst({
        where: ({ id }, { eq }) => eq(id, ticketId),
      });

      const clickUpConfig = await getUserConfigs({ ctx });

      const newTicket: createTicketType & {
        b1UpdatedAt?: Date | null;
        b2UpdatedAt?: Date | null;
        createdById: string;
        company: string;
      } = {
        createdById: ctx.session.user.id,
        card,
        company: env.COMPANY,
      };

      if ((b1Id || b1Id === null) && oldTicket?.b1Id !== b1Id) {
        const isAdding = Boolean(
          (!oldTicket?.b1Id && b1Id) || (oldTicket?.b1Id && b1Id),
        );
        const isRemoving = Boolean(
          (oldTicket?.b1Id && !b1Id) ||
            (oldTicket?.b1Id && b1Id && oldTicket?.b1Id !== b1Id),
        );

        newTicket.b1Id = b1Id;
        newTicket.b1UpdatedAt = isRemoving ? null : new Date();

        const params: {
          taskId: string;
          fieldId: string;
          token: string;
          addValue?: number;
          remValue?: number;
        } = {
          fieldId: clickUpConfig.B1UUID,
          token: clickUpConfig.decriptedToken,
          taskId: getClickupCardId(card)!,
        };

        if (isAdding && b1Id) {
          params.addValue = b1Id;
        }

        if (isRemoving && oldTicket?.b1Id) {
          params.remValue = oldTicket?.b1Id;
        }

        await setClickupCardCustomField(params);
      }

      if ((b2Id || b2Id === null) && oldTicket?.b2Id !== b2Id) {
        const isAdding = Boolean(
          (!oldTicket?.b2Id && b2Id) || (oldTicket?.b2Id && b2Id),
        );
        const isRemoving = Boolean(
          (oldTicket?.b2Id && !b2Id) ||
            (oldTicket?.b2Id && b2Id && oldTicket?.b2Id !== b2Id),
        );

        newTicket.b2Id = b2Id;
        newTicket.b2UpdatedAt = isRemoving ? null : new Date();

        const params: {
          taskId: string;
          fieldId: string;
          token: string;
          addValue?: number;
          remValue?: number;
        } = {
          fieldId: clickUpConfig.B2UUID,
          token: clickUpConfig.decriptedToken,
          taskId: getClickupCardId(card)!,
        };

        if (isAdding && b2Id) {
          params.addValue = b2Id;
        }

        if (isRemoving && oldTicket?.b2Id) {
          params.remValue = oldTicket?.b2Id;
        }

        await setClickupCardCustomField(params);
      }

      await ctx.db
        .update(tickets)
        .set(newTicket)
        .where(eq(tickets.id, ticketId));
    }),
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.query.tickets.findFirst({
        where({ id }, { eq }) {
          return eq(id, input.ticketId);
        },
      });

      if (ticket) {
        const clickUpConfig = await getUserConfigs({ ctx });

        const taskId = getClickupCardId(ticket.card);
        const response = await fetch(
          `https://api.clickup.com/api/v2/task/${taskId}`,
          {
            method: "PUT",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: clickUpConfig.decriptedToken,
            },
            body: JSON.stringify({ status: clickUpConfig.closedlabel }),
          },
        );

        if (response.ok === false) {
          const erro = await getErrorFromClickupApi(response);

          throw createError({
            code: "PRECONDITION_FAILED",
            message: `Erro ao tentar fechar o card. \n\nDetalhes: ${erro.err}`,
          });
        }
      }

      return await ctx.db
        .update(tickets)
        .set({ isClosed: true })
        .where(eq(tickets.id, input.ticketId))
        .returning();
    }),
  reopenTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.query.tickets.findFirst({
        where({ id }, { eq }) {
          return eq(id, input.ticketId);
        },
      });

      if (ticket) {
        const taskId = getClickupCardId(ticket.card);
        const clickUpConfig = await getUserConfigs({ ctx });

        const response = await fetch(
          `https://api.clickup.com/api/v2/task/${taskId}`,
          {
            method: "PUT",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: clickUpConfig.decriptedToken,
            },
            body: JSON.stringify({ status: clickUpConfig.openLabel }),
          },
        );

        if (response.ok === false) {
          const erro = await getErrorFromClickupApi(response);

          throw createError({
            code: "PRECONDITION_FAILED",
            message: `Erro ao tentar reabrir o card. \n\nDetalhes: ${erro.err}`,
          });
        }
      }

      return ctx.db
        .update(tickets)
        .set({ isClosed: false })
        .where(eq(tickets.id, input.ticketId))
        .returning();
    }),
  remove: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { ticketId } = input;

      return ctx.db.delete(tickets).where(eq(tickets.id, ticketId));
    }),

  getCompanyTickets: protectedProcedure
    .input(
      z.object({
        isClosed: z.boolean(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { isClosed, page, pageSize } = input;
      const b1User = aliasedTable(clickUpUser, "b1User");
      const b2User = aliasedTable(clickUpUser, "b2User");

      const query = ctx.db
        .select({
          b1User,
          b2User,
          tickets,
          totalCount: sql<string>`COUNT(*) OVER()`.as("totalCount"),
        })
        .from(tickets)
        .where(
          and(eq(tickets.company, env.COMPANY), eq(tickets.isClosed, isClosed)),
        )
        .leftJoin(b1User, eq(b1User.id, tickets.b1Id))
        .leftJoin(b2User, eq(b2User.id, tickets.b2Id))
        .orderBy(asc(tickets.id));

      if (typeof page === "number" && typeof pageSize === "number") {
        const { limit, offset } = getPaginationParams({ page, pageSize });

        query.limit(limit).offset(offset);
      }

      const companyTickets = await query;

      const result: {
        b1: {
          name: string | null | undefined;
          id: number | null;
        };
        b2: {
          name: string | null | undefined;
          id: number | null;
        };
        card: string;
        cardName: string;
        ticketId: number;
      }[] = [];

      for (const { b1User, b2User, tickets } of companyTickets) {
        const { card, id, b1Id, b2Id, cardName } = tickets;
        const { username: b1Name } = b1User ?? {};
        const { username: b2Name } = b2User ?? {};

        result.push({
          b1: { name: b1Name, id: b1Id },
          b2: { name: b2Name, id: b2Id },
          card,
          cardName,
          ticketId: id,
        });
      }
      const total =
        companyTickets.length > 0
          ? parseInt(companyTickets[0]?.totalCount ?? "0", 10)
          : 0;

      return { result, total, page, pageSize };
    }),

  refrehTicketName: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { ticketId } = input;
      const clickUpConfig = await getUserConfigs({ ctx });

      const ticket = await ctx.db.query.tickets.findFirst({
        where({ id }, { eq }) {
          return eq(id, ticketId);
        },
        columns: {
          card: true,
        },
      });

      if (!ticket) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message:
            "Card não encontrado. Recarregue a pagina e tente novamente.",
        });
      }

      const cardId = getClickupCardId(ticket.card);
      if (!cardId) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message:
            'Link mal formatado. O formato esperado é "https://app.clickup.com/t/{identificador do card}". Atualize o link do card e tente novamente.',
        });
      }

      const cardName = (await getClickUpCard({ cardId, clickUpConfig })).name;

      if (!cardName) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message:
            "Erro ao buscar nome do card. Verifique o link enviado e tente novamente. Atualize o link do card e tente novamente.",
        });
      }

      await ctx.db
        .update(tickets)
        .set({ cardName })
        .where(eq(tickets.id, ticketId));
    }),
});
