"use client";
import { type CheckedState } from "@radix-ui/react-checkbox";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { showErrorToast, showSuccessToast } from "~/lib/toasts-helpers";
import { getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";
import { MdOutlineCloudSync } from "react-icons/md";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

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
  const { mutate: populateTickets, isPending: isPopulatingTickets } =
    api.ticket.populateTickets.useMutation({
      async onSuccess() {
        showSuccessToast("Cards populados com sucesso");
        await utils.ticket.invalidate();
      },
      onError: showErrorToast,
    });
  const { mutate: populateUsers } = api.user.populateClickupUsers.useMutation({
    onSuccess() {
      showSuccessToast("Usuários salvos com sucesso");
      return;
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
      <h1 className="flex w-full items-center gap-2 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        <Link
          href={`/companies/${params.company}`}
          className="rounded-xl p-2 transition-colors hover:bg-white hover:text-primary"
        >
          <FaArrowLeft />
        </Link>
        {`Configurações da lista de B1 do ${params.company}`}
      </h1>
      <div className="flex w-full flex-col gap-2">
        <h3 className="flex w-full items-center justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
          Usuários encontrados
          <Button
            onClick={() => populateUsers()}
            type="button"
            variant="ghost"
            size={"icon"}
            title="Popular usuários do ClickUp"
          >
            <FaUserPlus />
          </Button>
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
            {users?.map?.(
              ({
                id,
                name,
                canBeB1,
                canBeB2,
                isListed,
                profilePicture,
                userColor,
              }) => (
                <TableRow key={id}>
                  <TableCell>
                    {
                      <Avatar>
                        <AvatarImage
                          src={profilePicture ?? ""}
                          alt="Foto do usuário"
                        />
                        <AvatarFallback
                          style={{
                            backgroundColor: userColor ? userColor : "#64748b",
                          }}
                        >
                          {getInitials(name ?? "AV")}
                        </AvatarFallback>
                      </Avatar>
                    }
                  </TableCell>
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
              ),
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full flex-col gap-2">
        <h3 className="flex w-full items-center justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
          Outras configurações:
        </h3>
        <div className="flex items-center justify-center gap-2 border-t-2 py-4">
          <div>Sincronizar cards da lista</div>
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => populateTickets()}
            disabled={isPopulatingTickets}
            className="px-4"
          >
            <MdOutlineCloudSync />
            Popular cards
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <InviteForm />
        </div>
      </div>
    </div>
  );
}

const inviteFormSchema = z.object({
  email: z.string().email(),
});

function InviteForm() {
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: createInvite } = api.invite.create.useMutation({
    onSuccess() {
      showSuccessToast("Usuário convidado com sucesso");
      form.reset();
    },
    onError: showErrorToast,
  });

  const submit = useCallback(
    (formDate: z.infer<typeof inviteFormSchema>) => {
      createInvite(formDate);
    },
    [createInvite],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="mb-4 flex w-3/4 gap-2"
      >
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full items-center space-y-0">
              <FormLabel className="w-1/3">Convide novos usuarios:</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Digite um email..."
                  {...field}
                ></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Button type="submit" variant={"secondary"}>
          <FaUserPlus />
          Convidar
        </Button>
      </form>
    </Form>
  );
}
