"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "~/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { OpenTicketRow } from "./OpenTicketRow";

const formSchema = z.object({
  card: z.string(),
  b1Id: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "null" ? null : v)),
  b2Id: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "null" ? null : v)),
});

export function ActiveTicketsTable() {
  const [selectKey, setSelectKey] = useState(+new Date());
  const utils = api.useUtils();
  const [activeTickets] = api.ticket.getCompanyTickets.useSuspenseQuery({
    isClosed: false,
  });
  const [users] = api.user.getUsers.useSuspenseQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      card: "",
    },
  });

  const { mutate: createTicket } = api.ticket.create.useMutation({
    onSuccess() {
      return utils.ticket.invalidate();
    },
  });
  const { mutate: update } = api.ticket.update.useMutation({
    onSuccess() {
      return utils.ticket.invalidate();
    },
  });
  const { mutate: closeTicketMutation } = api.ticket.closeTicket.useMutation({
    onSuccess() {
      return utils.ticket.invalidate();
    },
  });
  const { mutate: deleteTicket } = api.ticket.remove.useMutation({
    onSuccess() {
      return utils.ticket.invalidate();
    },
  });

  const addNewTicket = useCallback(
    (newTicket: z.infer<typeof formSchema>) => {
      return createTicket(newTicket);
    },
    [createTicket],
  );

  const updateTicket = useCallback(
    (
      newTicket: {
        card: string;
        b1Id?: string | null | undefined;
        b2Id?: string | null | undefined;
      },
      updatedTicketId: number,
    ) => {
      const oldTicket = activeTickets.find(
        ({ ticketId }) => ticketId === updatedTicketId,
      );
      if (oldTicket) {
        const { card, b1Id, b2Id } = newTicket;
        const updatedTicket: {
          card: string;
          b1Id?: string | null | undefined;
          b2Id?: string | null | undefined;
        } = {
          card,
        };

        if (b1Id !== oldTicket?.b1?.id) {
          updatedTicket.b1Id = b1Id === "null" ? null : b1Id;
        }
        if (b2Id !== oldTicket?.b2?.id) {
          updatedTicket.b2Id = b1Id === "null" ? null : b2Id;
        }

        update({ ...updatedTicket, ticketId: updatedTicketId });
      }
    },
    [activeTickets, update],
  );
  const closeTicket = useCallback(
    (ticketId: number) => closeTicketMutation({ ticketId }),
    [closeTicketMutation],
  );
  const removeTicket = useCallback(
    (ticketId: number) => {
      deleteTicket({ ticketId });
    },
    [deleteTicket],
  );

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
      //little hack to return selects to the placeholder text
      setSelectKey(+new Date());
    }
  }, [form, form.formState.isSubmitSuccessful]);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <h3 className="flex w-full justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
            Chamados em aberto
          </h3>
        </AccordionTrigger>
        <AccordionContent>
          <div className="">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={3}>Card</TableHead>
                  <TableHead>b1</TableHead>
                  <TableHead>b2</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTickets?.map(({ b1, b2, card, ticketId }) => (
                  <OpenTicketRow
                    key={`${card}-${ticketId}`}
                    card={card}
                    users={users}
                    b1={b1}
                    b2={b2}
                    update={(updatedTicket) =>
                      updateTicket(updatedTicket, ticketId)
                    }
                    closeTicket={() => closeTicket(ticketId)}
                    remove={() => removeTicket(ticketId)}
                  />
                ))}
              </TableBody>
            </Table>
            {/* new ticket form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addNewTicket)}>
                <Table className="table-fixed">
                  <TableBody>
                    <TableRow
                      key={"new-ticket"}
                      className="hover:bg-transparent"
                    >
                      <TableCell colSpan={3}>
                        <FormField
                          name="card"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Preencha o link do card"
                                  required
                                  {...field}
                                ></Input>
                              </FormControl>
                            </FormItem>
                          )}
                        ></FormField>
                      </TableCell>
                      <TableCell>
                        <FormField
                          name="b1Id"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? ""}
                                key={`b2Id${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um b1"></SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem key={-1} value={"null"}>
                                    <span className="w-100 p-3"></span>
                                  </SelectItem>

                                  {users.map(({ id, name }) => (
                                    <SelectItem key={id} value={id}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        ></FormField>
                      </TableCell>
                      <TableCell>
                        <FormField
                          name="b2Id"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? ""}
                                key={`b2Id${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um b2"></SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem key={-1} value={"null"}>
                                    <span className="w-100 p-3"></span>
                                  </SelectItem>
                                  {users.map(({ id, name }) => (
                                    <SelectItem key={id} value={id}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        ></FormField>
                      </TableCell>
                      <TableCell>
                        <Button variant={"secondary"} type="submit">
                          Adicionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </form>
            </Form>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
