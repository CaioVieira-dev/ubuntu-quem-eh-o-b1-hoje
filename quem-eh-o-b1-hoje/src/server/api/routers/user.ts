import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

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
});
