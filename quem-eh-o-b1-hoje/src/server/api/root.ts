import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { ticketRouter } from "./routers/ticket";
import { userRouter } from "./routers/user";
import { clickUpConfigRouter } from "./routers/clickUpConfig";
import { inviteRouter } from "./routers/invite";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  user: userRouter,
  clickUpConfig: clickUpConfigRouter,
  invite: inviteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
