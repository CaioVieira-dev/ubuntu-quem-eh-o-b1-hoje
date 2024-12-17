import { aliasedTable, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tickets, users } from "~/server/db/schema";

const createTicketSchema = z.object({
  card: z.string(),
  b1Id: z.string().optional().nullable(),
  b2Id: z.string().optional().nullable(),
});
const updateTicketSchema = createTicketSchema.and(
  z.object({ ticketId: z.number() }),
);

type createTicketType = z.infer<typeof createTicketSchema>;
type updateTicketType = z.infer<typeof updateTicketSchema>;
const COMPANY = "geolabor";

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

      return ctx.db.insert(tickets).values(newTicket);
    }),
  update: protectedProcedure
    .input(updateTicketSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      const { card, b1Id, b2Id, ticketId } = input;
      const oldTicket = await ctx.db.query.tickets.findFirst({
        where: ({ id }, { eq }) => eq(id, ticketId),
      });

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

      if (oldTicket?.b1Id !== b1Id) {
        newTicket.b1Id = b1Id;
        newTicket.b1UpdatedAt = new Date();
      }
      if (oldTicket?.b2Id !== b2Id) {
        newTicket.b2Id = b2Id;
        newTicket.b2UpdatedAt = new Date();
      }

      return ctx.db
        .update(tickets)
        .set(newTicket)
        .where(eq(tickets.id, ticketId));
    }),
  remove: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { ticketId } = input;

      return ctx.db.delete(tickets).where(eq(tickets.id, ticketId));
    }),

  getCompanyTickets: protectedProcedure.query(async ({ ctx }) => {
    const b1User = aliasedTable(users, "b1User");
    const b2User = aliasedTable(users, "b2User");

    const companyTickets = await ctx.db
      .select({
        b1User,
        b2User,
        tickets,
      })
      .from(tickets)
      .where(eq(tickets.company, COMPANY))
      .leftJoin(b1User, eq(b1User.id, tickets.b1Id))
      .leftJoin(b2User, eq(b2User.id, tickets.b2Id));

    return companyTickets.map(({ b1User, b2User, tickets }) => {
      const { card, id, b1Id, b2Id } = tickets;
      const { name: b1Name } = b1User ?? {};
      const { name: b2Name } = b2User ?? {};

      return {
        b1: { name: b1Name, id: b1Id },
        b2: { name: b2Name, id: b2Id },
        card,
        ticketId: id,
      };
    });
  }),
});
