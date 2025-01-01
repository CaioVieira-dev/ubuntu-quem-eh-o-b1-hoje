"server-only";

import { TRPCError } from "@trpc/server";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

export function createError({
  code,
  message,
}: {
  code: TRPC_ERROR_CODE_KEY;
  message?: string;
}) {
  return new TRPCError({
    code,
    message,
  });
}
