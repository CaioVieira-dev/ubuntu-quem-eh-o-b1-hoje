import { type TRPCClientErrorLike } from "@trpc/client";
import {
  type TRPC_ERROR_CODE_KEY,
  type TRPC_ERROR_CODE_NUMBER,
} from "@trpc/server/unstable-core-do-not-import";
import type postgres from "postgres";

import { toast } from "sonner";
import { type z } from "zod";

export const showErrorToast = (
  error: TRPCClientErrorLike<{
    input: unknown;
    output: postgres.RowList<never[]>;
    transformer: true;
    errorShape: {
      data: {
        zodError: z.typeToFlattenedError<unknown, string> | null;
        code: TRPC_ERROR_CODE_KEY;
        httpStatus: number;
        path?: string;
        stack?: string;
      };
      message: string;
      code: TRPC_ERROR_CODE_NUMBER;
    };
  }>,
) =>
  toast.error("Erro!!", {
    description: error.message,
    closeButton: true,
    position: "top-right",
  });

export const showErrorBoundaryToast = (message = "") =>
  toast.error("Erro!!", {
    description: message,
    closeButton: true,
    position: "top-right",
  });

export const showSuccessToast = (description = "") =>
  toast.success("Operação realizada com sucesso", {
    description,
    closeButton: true,
    position: "top-right",
  });
