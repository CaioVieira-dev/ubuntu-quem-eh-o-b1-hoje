import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { invites } from "~/server/db/schema";
import { createError } from "~/lib/error-helpers";

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
          return and(eq(email, input.email), eq(used, false));
        },
      });

      if (oldInvite) {
        throw createError({
          code: "PRECONDITION_FAILED",
          message: `Usuario já convidado. Pede para ele tentar logar mais uma vez.`,
        });
      }

      return ctx.db.insert(invites).values({ email: input.email, used: false });
    }),
});
