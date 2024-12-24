"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { FaCogs, FaSave } from "react-icons/fa";
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      b1FieldUUID: "",
      b2FieldUUID: "",
      clickUpUserToken: "",
    },
  });
  const { mutate: updateConfig } = api.clickUpConfig.update.useMutation({
    onSuccess() {
      form.reset();
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
          <SheetTitle className="text-white">Configurações</SheetTitle>
          <SheetDescription>Edite suas configurações:</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-2"
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
                  <FormControl>
                    <Input
                      placeholder="Preencha seu token do ClickUp"
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormDescription>
                    Token encontrado nas configurações do ClickUp
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
      </SheetContent>
    </Sheet>
  );
}
