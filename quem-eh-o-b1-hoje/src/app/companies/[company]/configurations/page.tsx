"use client";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { showErrorToast } from "~/lib/toasts-helpers";
import { api } from "~/trpc/react";

export default function Company() {
  const params = useParams<{ company: string }>();
  const utils = api.useUtils();
  const [users] = api.user.getUsers.useSuspenseQuery();
  const { mutate: updateUser, isPending } = api.user.updateUser.useMutation({
    async onSuccess() {
      await utils.user.invalidate();
    },
    onError: showErrorToast,
  });

  const updateClickupUser = useCallback(
    ({
      id,
      field,
      value,
    }: {
      id: number;
      field: "canBeB1" | "canBeB2" | "isListed";
      value: boolean;
    }) => updateUser({ id, [field]: value }),
    [updateUser],
  );
  const getValueFromCheckedState = useCallback(
    (value: CheckedState) =>
      value === "indeterminate" ? false : value ? true : false,
    [],
  );

  return (
    <div className="container flex max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        {`Configurações da lista de B1 do ${params.company}`}
      </h1>
      <div className="flex w-full flex-col gap-2">
        <h3 className="flex w-full justify-center text-xl font-extrabold tracking-tight sm:text-[2rem]">
          Usuários encontrados
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>Nome</TableHead>
              <TableHead className="text-center">
                Está na lista de B1?
              </TableHead>
              <TableHead className="text-center">Pode ser B1</TableHead>
              <TableHead className="text-center">Pode ser B2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map?.(({ id, name, canBeB1, canBeB2, isListed }) => (
              <TableRow key={id}>
                <TableCell>AV </TableCell>
                <TableCell>{name}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    className="border-white"
                    checked={isListed}
                    onCheckedChange={(value) =>
                      updateClickupUser({
                        id,
                        field: "isListed",
                        value: getValueFromCheckedState(value),
                      })
                    }
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    className="border-white"
                    checked={canBeB1}
                    onCheckedChange={(value) =>
                      updateClickupUser({
                        id,
                        field: "canBeB1",
                        value: getValueFromCheckedState(value),
                      })
                    }
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    className="border-white"
                    checked={canBeB2}
                    onCheckedChange={(value) =>
                      updateClickupUser({
                        id,
                        field: "canBeB2",
                        value: getValueFromCheckedState(value),
                      })
                    }
                    disabled={isPending}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
