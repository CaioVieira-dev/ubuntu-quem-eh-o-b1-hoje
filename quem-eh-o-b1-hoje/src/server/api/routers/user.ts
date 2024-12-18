import { aliasedTable, eq, max } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tickets, users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const possibleUsers = await ctx.db
      .select({
        name: users.name,
        id: users.id,
      })
      .from(users);

    return possibleUsers.map(({ id, name }) => {
      return { name: name ?? "sem nome", id };
    });
  }),
  getLastTimeInTicketAsB1AndB2: protectedProcedure.query(async ({ ctx }) => {
    const b1Ticket = aliasedTable(tickets, "b1Ticket");
    const b2Ticket = aliasedTable(tickets, "b2Ticket");

    const maxB1DateTicket = ctx.db
      .select({
        maxB1TicketUpdatedAt: max(b1Ticket.b1UpdatedAt).as(
          "maxB1TicketUpdatedAt",
        ),
        b1Id: b1Ticket.b1Id,
      })
      .from(b1Ticket)
      .groupBy(b1Ticket.b1Id)
      .as("maxB1DateTicket");
    const maxB2DateTicket = ctx.db
      .select({
        maxB2TicketUpdatedAt: max(b2Ticket.b2UpdatedAt).as(
          "maxB2TicketUpdatedAt",
        ),
        b2Id: b2Ticket.b2Id,
      })
      .from(b2Ticket)
      .groupBy(b2Ticket.b2Id)
      .as("maxB2DateTicket");

    /**The query as sql works, but it doesn't have the types from typescript as well defined */
    // const r = await ctx.db.execute(sql`
    //     select
    //       "user"."id",
    //       "user"."name",
    //       "ticketB1"."id" as "b1Ticket",
    //       "ticketB1"."b1_updated_at" as "lastTimeAsB1",
    //       "ticketB2"."id" as "b2Ticket",
    //       "ticketB2"."b2_updated_at" as "lastTimeAsB2"
    //     from "quem-eh-o-b1-hoje_user" as "user"
    //       left join (
    //           select *
    //       from "quem-eh-o-b1-hoje_ticket" as "ticket_b1_sub_1"
    //       where "ticket_b1_sub_1"."b1_updated_at" = (
    //           select MAX("ticket_b1_sub_2"."b1_updated_at")
    //           from "quem-eh-o-b1-hoje_ticket" as "ticket_b1_sub_2"
    //           where "ticket_b1_sub_2"."b1Id" = "ticket_b1_sub_1"."b1Id"
    //       )
    //     ) as "ticketB1" on "ticketB1"."b1Id" = "user"."id"
    //       left join (
    //           select *
    //       from "quem-eh-o-b1-hoje_ticket" as "ticket_b2_sub_1"
    //       where "ticket_b2_sub_1"."b2_updated_at" = (
    //           select MAX("ticket_b2_sub_2"."b2_updated_at")
    //           from "quem-eh-o-b1-hoje_ticket" as "ticket_b2_sub_2"
    //           where "ticket_b2_sub_2"."b1Id" = "ticket_b2_sub_1"."b1Id"
    //       )
    //     ) as "ticketB2" on "ticketB2"."b2Id" = "user"."id"
    //   `);

    return ctx.db
      .select({
        id: users.id,
        name: users.name,
        b1Ticket: maxB1DateTicket.b1Id,
        lastTimeAsB1: maxB1DateTicket.maxB1TicketUpdatedAt,
        b2Ticket: maxB2DateTicket.b2Id,
        lastTimeAsB2: maxB2DateTicket.maxB2TicketUpdatedAt,
      })
      .from(users)
      .leftJoin(maxB1DateTicket, eq(maxB1DateTicket.b1Id, users.id))
      .leftJoin(maxB2DateTicket, eq(maxB2DateTicket.b2Id, users.id));
  }),
});
