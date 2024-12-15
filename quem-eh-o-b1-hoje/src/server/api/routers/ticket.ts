import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tickets } from "~/server/db/schema";

const ticketSchema = z.object({
  card: z.string(),
  b1: z.string().optional(),
  b2: z.string().optional(),
});

type ticketType = z.infer<typeof ticketSchema>;

export const ticketRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ticketSchema)
    .mutation(async ({ ctx, input }) => {
      const { card, b1, b2 } = input;

      const newTicket: ticketType & {
        b1UpdatedAt?: Date;
        b2UpdatedAt?: Date;
        createdById: string;
      } = {
        createdById: ctx.session.user.id,
        card,
      };

      if (b1) {
        newTicket.b1 = ctx.session.user.id;
        // newTicket.b1 = b1;
        newTicket.b1UpdatedAt = new Date();
      }
      if (b2) {
        newTicket.b2 = b1;
        newTicket.b2UpdatedAt = new Date();
      }

      return ctx.db.insert(tickets).values(newTicket).returning();
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
