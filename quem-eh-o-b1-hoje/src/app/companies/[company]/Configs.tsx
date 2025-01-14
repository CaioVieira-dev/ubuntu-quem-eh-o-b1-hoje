"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCogs, FaSave } from "react-icons/fa";
import { MdOutlineCloudSync } from "react-icons/md";
import {
  FaArrowRight,
  FaRegEye,
  FaRegEyeSlash,
  FaUserPlus,
} from "react-icons/fa6";
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
  linkedTicketListId: z
    .bigint()
    .refine((val) => val > 0n, "O valor precisa ser positivo."),
  b1FieldUuid: z.string().optional(),
  b2FieldUuid: z.string().optional(),
  openLabel: z.string().optional(),
  closedLabel: z.string().optional(),
});

export function Configs({ userId }: { userId: string }) {
  const params = useParams<{ company: string }>();
  const utils = api.useUtils();
  const { mutate: populateTickets, isPending: isPopulatingTickets } =
    api.ticket.populateTickets.useMutation({
      async onSuccess() {
        showSuccessToast("Cards populados com sucesso");
        await utils.ticket.invalidate();
      },
      onError: showErrorToast,
    });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <FaCogs />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll bg-gradient-to-b from-[#2e026d] to-[#15162c] pb-24 text-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gradient-to-b [&::-webkit-scrollbar-track]:from-[#2e026d] [&::-webkit-scrollbar-track]:to-[#15162c] [&::-webkit-scrollbar]:w-2">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white">
            Configurações do usuario
          </SheetTitle>
          <SheetDescription>Edite suas configurações:</SheetDescription>
        </SheetHeader>

        <UserConfigForm userId={userId} />
        <div className="flex flex-col gap-2 border-t-2 py-4">
          <Link
            href={`/companies/${params.company}/configurations`}
            className="flex items-center justify-center gap-2 rounded-md bg-white p-2 text-primary transition-colors hover:bg-white/80"
          >
            Outras configurações <FaArrowRight />
          </Link>
        </div>
        <div className="flex flex-col gap-2 border-t-2 py-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => populateTickets()}
            disabled={isPopulatingTickets}
          >
            <MdOutlineCloudSync />
            Popular cards
          </Button>
        </div>
        <div className="flex flex-col gap-2 border-t-2 py-4">
          <InviteForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UserConfigForm({ userId }: { userId: string }) {
  const utils = api.useUtils();

  const [showToken, setShowToken] = useState(false);
  const [userConfig] = api.clickUpConfig.get.useSuspenseQuery();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      b1FieldUuid: userConfig.B1UUID ?? "",
      b2FieldUuid: userConfig.B2UUID ?? "",
      openLabel: userConfig.openLabel ?? "",
      closedLabel: userConfig.closedLabel ?? "",
      ticketListId: userConfig.ticketListId ?? ("" as unknown as bigint),
      linkedTicketListId:
        userConfig.linkedTicketListId ?? ("" as unknown as bigint),
      clickUpUserToken: "",
    },
  });
  const { mutate: updateConfig } = api.clickUpConfig.update.useMutation({
    async onSuccess([data]) {
      showSuccessToast("Configuração salva com sucesso");
      await utils.clickUpConfig.invalidate();
      form.reset({
        userId,
        b1FieldUuid: data?.b1FieldUuid ?? "",
        b2FieldUuid: data?.b2FieldUuid ?? "",
        closedLabel: data?.closedLabel ?? "",
        openLabel: data?.openLabel ?? "",
        ticketListId: data?.ticketListId ?? ("" as unknown as bigint),
        linkedTicketListId:
          data?.linkedTicketListId ?? ("" as unknown as bigint),
        clickUpUserToken: "",
      });
    },
  });

  const submit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      updateConfig(data);
    },
    [updateConfig],
  );

  return (
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
                  variant="secondary"
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
          name="b1FieldUuid"
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
          name="b2FieldUuid"
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
        <FormField
          name="openLabel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label para status aberto:</FormLabel>
              <FormControl>
                <Input {...field}></Input>
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          name="closedLabel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label para status fechado:</FormLabel>
              <FormControl>
                <Input {...field}></Input>
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          name="linkedTicketListId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Id de uma lista de cards secundaria:</FormLabel>
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
              <FormDescription>
                Lista secundaria onde cards podem ser criados no ClickUp ao
                adicionar um card neste app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Button type="submit" variant={"secondary"}>
          <FaSave />
          Salvar
        </Button>
      </form>
    </Form>
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
        <Button type="submit" variant={"secondary"}>
          <FaUserPlus />
          Convidar
        </Button>
      </form>
    </Form>
  );
}
