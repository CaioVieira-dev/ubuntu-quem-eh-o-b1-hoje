import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type * as Schema from "~/server/db/schema";
import { clickUpConfigs } from "~/server/db/schema";
import { z } from "zod";
import { decryptToken, encryptToken } from "~/lib/cypto-helpers";
import { type User } from "next-auth";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";

const updateClickUpConfigSchema = z.object({
  userId: z.string(),
  clickUpUserToken: z.string().optional(),
  ticketListId: z.bigint().optional(),
  b1FieldUUID: z.string().optional(),
  b2FieldUUID: z.string().optional(),
});

type updateClickUpConfigType = z.infer<typeof updateClickUpConfigSchema>;

export const getUserConfigs = async ({
  ctx,
}: {
  ctx: {
    session: {
      user: {
        id: string;
      } & User;
      expires: string;
    };
    headers: Headers;
    db: PostgresJsDatabase<typeof Schema>;
  };
}) => {
  const [clickUpConfig] = await ctx.db
    .select({
      B1UUID: clickUpConfigs.b1FieldUuid,
      B2UUID: clickUpConfigs.b2FieldUuid,
      ticketListId: clickUpConfigs.ticketListId,
      encryptedToken: clickUpConfigs.clickUpUserToken,
    })
    .from(clickUpConfigs)
    .where(eq(clickUpConfigs.userId, ctx.session.user.id));

  if (!clickUpConfig) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Configuração do usuario não encontrada. Crie uma nova configuração e tente novamente",
    });
  }

  if (!clickUpConfig?.encryptedToken) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Configuração do token de API pessoal do usuario não encontrado. Adicione seu token nas configurações e tente novamente",
    });
  }
  if (!clickUpConfig?.ticketListId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Configuração do identificador da lista de cards não encontrado. Adicione o identificador nas configurações e tente novamente",
    });
  }

  if (!clickUpConfig?.B1UUID) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Configuração do identificador do campo customizado B1 não encontrado. Crie adicione o identificador do campo customizado B1 nas configurações e tente novamente",
    });
  }
  if (!clickUpConfig?.B2UUID) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Configuração do identificador do campo customizado B2 não encontrado. Crie adicione o identificador do campo customizado B2 nas configurações e tente novamente",
    });
  }

  const decriptedToken = decryptToken(clickUpConfig?.encryptedToken);
  return {
    decriptedToken,
    B1UUID: clickUpConfig.B1UUID,
    B2UUID: clickUpConfig.B2UUID,
    listId: clickUpConfig.ticketListId,
  };
};

export const clickUpConfigRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateClickUpConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        userId,
        b1FieldUUID,
        b2FieldUUID,
        clickUpUserToken,
        ticketListId,
      } = input;

      const newConfig: updateClickUpConfigType & {
        clickUpUserTokenUpdatedAt?: Date;
      } = {
        userId,
        b1FieldUUID,
        b2FieldUUID,
        ticketListId,
      };

      if (clickUpUserToken) {
        newConfig.clickUpUserToken = encryptToken(clickUpUserToken);
        newConfig.clickUpUserTokenUpdatedAt = new Date();
      }

      await ctx.db.insert(clickUpConfigs).values(newConfig).onConflictDoUpdate({
        target: clickUpConfigs.userId,
        set: newConfig,
      });
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    const [clickUpConfig] = await ctx.db
      .select({
        B1UUID: clickUpConfigs.b1FieldUuid,
        B2UUID: clickUpConfigs.b2FieldUuid,
        ticketListId: clickUpConfigs.ticketListId,
        tokenUpdatedAt: clickUpConfigs.clickUpUserTokenUpdatedAt,
        encriptedToken: clickUpConfigs.clickUpUserToken,
      })
      .from(clickUpConfigs)
      .where(eq(clickUpConfigs.userId, ctx.session.user.id));

    return {
      B1UUID: clickUpConfig?.B1UUID,
      B2UUID: clickUpConfig?.B2UUID,
      ticketListId: clickUpConfig?.ticketListId,
      tokenUpdatedAt: clickUpConfig?.tokenUpdatedAt,
      tokenIsFiiled: Boolean(clickUpConfig?.encriptedToken),
    };
  }),
});
