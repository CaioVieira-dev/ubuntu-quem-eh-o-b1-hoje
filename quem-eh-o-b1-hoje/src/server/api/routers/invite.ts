import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { invites } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const inviteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const oldInvite = await ctx.db.query.invites.findFirst({
        where({ email, used }, { and, eq }) {
          return and(eq(email, input.email), eq(used, true));
        },
      });

      if (oldInvite) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Usuario já convidado. Pede para ele tentar logar mais uma vez.`,
        });
      }

      return ctx.db.insert(invites).values({ email: input.email, used: false });
    }),
});
