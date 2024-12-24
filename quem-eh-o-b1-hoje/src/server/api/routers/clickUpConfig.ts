import { sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clickUpConfigs } from "~/server/db/schema";
import { z } from "zod";
import { encryptToken } from "~/lib/cypto-helpers";

const updateClickUpConfigSchema = z.object({
  userId: z.string(),
  clickUpUserToken: z.string().optional(),
  ticketListId: z.bigint().optional(),
  b1FieldUUID: z.string().optional(),
  b2FieldUUID: z.string().optional(),
});

type updateClickUpConfigType = z.infer<typeof updateClickUpConfigSchema>;

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

      //snippet from https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-2506150847
      const setObject = Object.keys(newConfig).reduce(
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

      await ctx.db.insert(clickUpConfigs).values(newConfig).onConflictDoUpdate({
        target: clickUpConfigs.userId,
        set: setObject,
      });
    }),
});
