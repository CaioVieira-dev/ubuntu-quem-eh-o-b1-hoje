import { sql } from "drizzle-orm";

export const getOnConflictDoUpdateSet = (example: object) => {
  //snippet from https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-2506150847
  return Object.keys(example).reduce(
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
};
