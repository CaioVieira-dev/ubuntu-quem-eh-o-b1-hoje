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
import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { OpenTicketRow } from "./OpenTicketRow";
import { showErrorToast, showSuccessToast } from "~/lib/toasts-helpers";

const formSchema = z.object({
  card: z.string(),
  b1Id: z.preprocess((val) => {
    if (val === "null") {
      return null;
    }
    if (typeof val === "string") {
      return parseInt(val, 10);
    }
    return val;
  }, z.number().optional().nullable()),
  b2Id: z.preprocess((val) => {
    if (val === "null") {
      return null;
    }
    if (typeof val === "string") {
      return parseInt(val, 10);
    }
    return val;
  }, z.number().optional().nullable()),
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

  const { mutate: createTicket, isPending: isCreatingTicket } =
    api.ticket.create.useMutation({
      async onSuccess() {
        showSuccessToast("Card registrado com sucesso");
        await utils.ticket.invalidate();
        await utils.user.invalidate();
        form.reset();
        //little hack to return selects to the placeholder text
        setSelectKey(+new Date());
      },
      onError: showErrorToast,
    });
  const { mutate: update, isPending: isUpdatingTicket } =
    api.ticket.update.useMutation({
      async onSuccess() {
        showSuccessToast("Card atualizado com sucesso");
        await utils.ticket.invalidate();
        await utils.user.invalidate();
      },
      onError: showErrorToast,
    });
  const { mutate: closeTicketMutation, isPending: isClosingTicket } =
    api.ticket.closeTicket.useMutation({
      onSuccess() {
        showSuccessToast("Card fechado com sucesso");
        return utils.ticket.invalidate();
      },
      onError: showErrorToast,
    });
  const {
    mutate: refreshTicketNameMutation,
    isPending: isRefreshingTicketName,
  } = api.ticket.refrehTicketName.useMutation({
    onSuccess() {
      showSuccessToast("Nome do card atualizado com sucesso");
      return utils.ticket.invalidate();
    },
    onError: showErrorToast,
  });
  const { mutate: deleteTicket, isPending: isDeletingTicket } =
    api.ticket.remove.useMutation({
      async onSuccess() {
        showSuccessToast("Card removido com sucesso");
        await utils.ticket.invalidate();
        await utils.user.invalidate();
      },
      onError: showErrorToast,
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
          b1Id?: number | null | undefined;
          b2Id?: number | null | undefined;
        } = {
          card,
        };

        if (b1Id !== oldTicket?.b1?.id) {
          updatedTicket.b1Id = b1Id === "null" ? null : parseInt(b1Id!, 10);
        }
        if (b2Id !== oldTicket?.b2?.id) {
          updatedTicket.b2Id = b2Id === "null" ? null : parseInt(b2Id!, 10);
        }

        update({ ...updatedTicket, ticketId: updatedTicketId });
      }
    },
    [activeTickets, update],
  );
  const updateTicketName = useCallback(
    (ticketId: number) => refreshTicketNameMutation({ ticketId }),
    [refreshTicketNameMutation],
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
                {activeTickets?.map(({ b1, b2, card, ticketId, cardName }) => (
                  <OpenTicketRow
                    key={`${card}-${ticketId}`}
                    card={card}
                    cardName={cardName}
                    users={users}
                    b1={b1}
                    b2={b2}
                    update={(updatedTicket) =>
                      updateTicket(updatedTicket, ticketId)
                    }
                    updateTicketName={() => updateTicketName(ticketId)}
                    closeTicket={() => closeTicket(ticketId)}
                    remove={() => removeTicket(ticketId)}
                    isSaving={
                      isUpdatingTicket ||
                      isClosingTicket ||
                      isRefreshingTicketName ||
                      isDeletingTicket
                    }
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
                                  disabled={isCreatingTicket}
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
                                defaultValue={
                                  field.value ? `${field.value}` : ""
                                }
                                disabled={isCreatingTicket}
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
                                    <SelectItem key={id} value={`${id}`}>
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
                                defaultValue={
                                  field.value ? `${field.value}` : ""
                                }
                                disabled={isCreatingTicket}
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
                                    <SelectItem key={id} value={`${id}`}>
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
                        <Button
                          variant={"secondary"}
                          type="submit"
                          disabled={isCreatingTicket}
                        >
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
