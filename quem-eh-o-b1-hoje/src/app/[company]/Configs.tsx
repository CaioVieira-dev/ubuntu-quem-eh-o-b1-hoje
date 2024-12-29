"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCogs, FaSave } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash, FaUserPlus } from "react-icons/fa6";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { showErrorToast, showSuccessToast } from "~/lib/toasts-helpers";
import { api } from "~/trpc/react";

const formSchema = z.object({
  userId: z.string(),
  clickUpUserToken: z.string().optional(),
  ticketListId: z
    .bigint()
    .refine((val) => val > 0n, "O valor precisa ser positivo."),
  b1FieldUUID: z.string().optional(),
  b2FieldUUID: z.string().optional(),
});

export function Configs({ userId }: { userId: string }) {
  const [showToken, setShowToken] = useState(false);
  const [userConfig] = api.clickUpConfig.get.useSuspenseQuery();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      b1FieldUUID: userConfig.B1UUID ?? "",
      b2FieldUUID: userConfig.B2UUID ?? "",
      ticketListId: userConfig.ticketListId ?? ("" as unknown as bigint),
      clickUpUserToken: "",
    },
  });
  const { mutate: updateConfig } = api.clickUpConfig.update.useMutation({
    onSuccess() {
      showSuccessToast("Configuração salva com sucesso");
      form.reset();
    },
  });
  const { mutate: populateUsers } = api.user.populateClickupUsers.useMutation({
    onSuccess() {
      showSuccessToast("Usuários salvos com sucesso");
      return;
    },
  });

  const submit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      updateConfig(data);
    },
    [updateConfig],
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <FaCogs />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white">
            Configurações do usuario
          </SheetTitle>
          <SheetDescription>Edite suas configurações:</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="mb-4 flex flex-col gap-2"
          >
            <FormField
              name="userId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="hidden"></Input>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <FormField
              name="clickUpUserToken"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token da API do ClickUp:</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        placeholder="Preencha seu token do ClickUp"
                        type={showToken ? "text" : "password"}
                        autoComplete="off"
                        {...field}
                        className="rounded-e-none"
                      ></Input>
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      title={showToken ? "Esconder" : "Mostrar"}
                      className="rounded-s-none"
                    >
                      {showToken ? <FaRegEyeSlash /> : <FaRegEye />}
                    </Button>
                  </div>
                  <FormDescription>
                    Token encontrado nas configurações do ClickUp.{" "}
                    {userConfig.tokenIsFiiled &&
                      `Ultima atualização em ${userConfig?.tokenUpdatedAt?.toLocaleDateString() ?? ""}`}
                  </FormDescription>
                </FormItem>
              )}
            ></FormField>
            <FormField
              name="ticketListId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Id da lista dos cards:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      value={field?.value?.toString?.() ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? BigInt(value) : 0n); // Convert to to BigInt
                      }}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              name="b1FieldUUID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Id do campo B1 nos cards:</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <FormField
              name="b2FieldUUID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Id do campo B2 nos cards:</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <Button type="submit" variant={"default"}>
              <FaSave />
              Salvar
            </Button>
          </form>
        </Form>

        <div className="flex flex-col gap-2 border-t-2 py-4">
          <h4>Configurações do app:</h4>
          <InviteForm />

          <div className="flex flex-col gap-2">
            Faltou alguem na lista de B1?
            <Button
              onClick={() => populateUsers()}
              type="button"
              className="w-full"
            >
              Popular usuarios do ClickUp
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
        className="mb-4 flex flex-col gap-2"
      >
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Convide novos usuarios:</FormLabel>
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
        <Button type="submit" variant={"default"}>
          <FaUserPlus />
          Convidar
        </Button>
      </form>
    </Form>
  );
}
