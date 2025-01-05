import { aliasedTable, asc, count, eq, max, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clickUpUser, tickets } from "~/server/db/schema";
import { getUserConfigs } from "./clickUpConfig";

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const possibleUsers = await ctx.db
      .select({
        name: clickUpUser.username,
        id: clickUpUser.id,
      })
      .from(clickUpUser);

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
        timesAsB1: count(b1Ticket.b1Id).as("timesAsB1"),
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
        timesAsB2: count(b2Ticket.b2Id).as("timesAsB2"),
      })
      .from(b2Ticket)
      .groupBy(b2Ticket.b2Id)
      .as("maxB2DateTicket");

    return ctx.db
      .select({
        id: clickUpUser.id,
        name: clickUpUser.username,
        b1Ticket: maxB1DateTicket.b1Id,
        lastTimeAsB1: maxB1DateTicket.maxB1TicketUpdatedAt,
        timesAsB1: maxB1DateTicket.timesAsB1,
        b2Ticket: maxB2DateTicket.b2Id,
        lastTimeAsB2: maxB2DateTicket.maxB2TicketUpdatedAt,
        timesAsB2: maxB2DateTicket.timesAsB2,
      })
      .from(clickUpUser)
      .leftJoin(maxB1DateTicket, eq(maxB1DateTicket.b1Id, clickUpUser.id))
      .leftJoin(maxB2DateTicket, eq(maxB2DateTicket.b2Id, clickUpUser.id))
      .orderBy(
        asc(maxB1DateTicket.timesAsB1),
        asc(maxB1DateTicket.maxB1TicketUpdatedAt),
        asc(maxB2DateTicket.timesAsB2),
        asc(maxB2DateTicket.maxB2TicketUpdatedAt),
        asc(clickUpUser.username),
      );
  }),

  populateClickupUsers: protectedProcedure.mutation(async ({ ctx }) => {
    const clickUpConfig = await getUserConfigs({ ctx });

    const listMembers = (await fetch(
      `https://api.clickup.com/api/v2/list/${clickUpConfig.listId}/member`,
      {
        method: "GET",
        headers: {
          Authorization: clickUpConfig.decriptedToken,
        },
      },
    ).then((response): unknown => response.json())) as {
      members: {
        id: number;
        username: string;
        email: string;
        profilePicture?: string;
      }[];
    };

    if (listMembers?.members.length > 0) {
      //snippet from https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-2506150847
      const setObject = Object.keys(listMembers.members[0] as object).reduce(
        (acc, key) => {
          // Convert camelCase keys to snake_case for database compatibility,
          // this is specially necessary if you have relationships
          const columnName = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          acc[columnName] = sql.raw(`excluded."${columnName}"`);
          return acc;
        },
        {} as Record<string, unknown>,
      );

      await ctx.db
        .insert(clickUpUser)
        .values(listMembers.members)
        .onConflictDoUpdate({
          target: clickUpUser.id,
          set: setObject,
        });
    }

    return;
  }),
});
