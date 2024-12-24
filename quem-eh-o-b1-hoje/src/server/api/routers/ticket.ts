import { aliasedTable, and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clickUpUser, tickets } from "~/server/db/schema";
import { getUserConfigs } from "./clickUpConfig";

const createTicketSchema = z.object({
  card: z.string(),
  b1Id: z.number().optional().nullable(),
  b2Id: z.number().optional().nullable(),
});
const updateTicketSchema = createTicketSchema.and(
  z.object({ ticketId: z.number() }),
);

type createTicketType = z.infer<typeof createTicketSchema>;
const COMPANY = "geolabor";

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

  await fetch(
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
}

function getClickupCardId(url: string) {
  const splittedCard = url?.split?.("/");
  const cardId = splittedCard?.[splittedCard?.length - 1];

  return cardId;
}

export const ticketRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const { card, b1Id, b2Id } = input;

      const newTicket: createTicketType & {
        b1UpdatedAt?: Date;
        b2UpdatedAt?: Date;
        createdById: string;
        company: string;
      } = {
        createdById: ctx.session.user.id,
        card,
        company: COMPANY,
      };

      newTicket.b1Id = b1Id;
      if (b1Id) {
        newTicket.b1UpdatedAt = new Date();
      }
      newTicket.b2Id = b2Id;
      if (b2Id) {
        newTicket.b2UpdatedAt = new Date();
      }

      const clickUpConfig = await getUserConfigs({ ctx });

      await ctx.db.insert(tickets).values(newTicket);

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
        company: COMPANY,
      };

      if (oldTicket?.b1Id !== b1Id) {
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
      if (oldTicket?.b2Id !== b2Id) {
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
      const closedTickets = await ctx.db
        .update(tickets)
        .set({ isClosed: true })
        .where(eq(tickets.id, input.ticketId))
        .returning();

      if (closedTickets[0]) {
        const clickUpConfig = await getUserConfigs({ ctx });

        const taskId = getClickupCardId(closedTickets[0].card);
        await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
          method: "PUT",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: clickUpConfig.decriptedToken,
          },
          body: JSON.stringify({ status: "fechado" }),
        });
      }
    }),
  reopenTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reopenedTickets = await ctx.db
        .update(tickets)
        .set({ isClosed: false })
        .where(eq(tickets.id, input.ticketId))
        .returning();

      if (reopenedTickets[0]) {
        const taskId = getClickupCardId(reopenedTickets[0].card);
        const clickUpConfig = await getUserConfigs({ ctx });

        await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
          method: "PUT",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: clickUpConfig.decriptedToken,
          },
          body: JSON.stringify({ status: "aberto" }),
        });
      }
    }),
  remove: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { ticketId } = input;

      return ctx.db.delete(tickets).where(eq(tickets.id, ticketId));
    }),

  getCompanyTickets: protectedProcedure
    .input(z.object({ isClosed: z.boolean() }))
    .query(async ({ ctx, input }) => {
      const { isClosed } = input;
      const b1User = aliasedTable(clickUpUser, "b1User");
      const b2User = aliasedTable(clickUpUser, "b2User");

      const companyTickets = await ctx.db
        .select({
          b1User,
          b2User,
          tickets,
        })
        .from(tickets)
        .where(
          and(eq(tickets.company, COMPANY), eq(tickets.isClosed, isClosed)),
        )
        .leftJoin(b1User, eq(b1User.id, tickets.b1Id))
        .leftJoin(b2User, eq(b2User.id, tickets.b2Id));

      const resultado: {
        b1: {
          name: string | null | undefined;
          id: number | null;
        };
        b2: {
          name: string | null | undefined;
          id: number | null;
        };
        card: string;
        cardName?: string;
        ticketId: number;
      }[] = [];

      const clickupCardsAPIPath = "https://api.clickup.com/api/v2/task/";
      const clickUpConfig = await getUserConfigs({ ctx });

      for (const { b1User, b2User, tickets } of companyTickets) {
        const { card, id, b1Id, b2Id } = tickets;
        const { username: b1Name } = b1User ?? {};
        const { username: b2Name } = b2User ?? {};

        const cardId = getClickupCardId(card);

        const clickupCard = (await fetch(`${clickupCardsAPIPath}${cardId}`, {
          method: "GET",
          headers: {
            Authorization: clickUpConfig.decriptedToken,
          },
        }).then((response): unknown => response.json())) as { name?: string };

        resultado.push({
          b1: { name: b1Name, id: b1Id },
          b2: { name: b2Name, id: b2Id },
          card,
          cardName: clickupCard?.name,
          ticketId: id,
        });
      }

      return resultado;
    }),
});
