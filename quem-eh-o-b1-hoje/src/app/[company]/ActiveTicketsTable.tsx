"use client";

import { useForm } from "react-hook-form";
import { FaArrowLeft, FaPencil, FaTrash } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
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

const formSchema = z.object({
  card: z.string(),
  b1: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "null" ? null : v)),
  b2: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "null" ? null : v)),
});

export function ActiveTicketsTable() {
  const [selectKey, setSelectKey] = useState(+new Date());
  const utils = api.useUtils();
  const [activeTickets] = api.ticket.getCompanyTickets.useSuspenseQuery();
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
        b1?: string | null | undefined;
        b2?: string | null | undefined;
      },
      updatedTicketId: number,
    ) => {
      const oldTicket = activeTickets.find(
        ({ ticketId }) => ticketId === updatedTicketId,
      );
      if (oldTicket) {
        const { card, b1, b2 } = newTicket;
        const updatedTicket: {
          card: string;
          b1?: string | null | undefined;
          b2?: string | null | undefined;
        } = {
          card,
        };

        if (b1 !== oldTicket?.b1?.id) {
          updatedTicket.b1 = b1 === "null" ? null : b1;
        }
        if (b2 !== oldTicket?.b2?.id) {
          updatedTicket.b2 = b1 === "null" ? null : b2;
        }

        update({ ...updatedTicket, ticketId: updatedTicketId });
      }
    },
    [activeTickets, update],
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
                  <TableHead>B1</TableHead>
                  <TableHead>B2</TableHead>
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
                          name="b1"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? ""}
                                key={`b2${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um B1"></SelectValue>
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
                          name="b2"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? ""}
                                key={`b2${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um B2"></SelectValue>
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

function OpenTicketRow({
  card,
  b1,
  b2,
  users,
  update,
  remove,
}: {
  card: string;
  b1?: { name: string | null | undefined; id: string | null };
  b2?: { name: string | null | undefined; id: string | null };
  users: { name: string; id: string }[];
  update: (updatedTicket: {
    card: string;
    b1?: string | null | undefined;
    b2?: string | null | undefined;
  }) => void;
  remove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCard, setUpdatedCard] = useState(card);
  const [updatedB1, setUpdatedB1] = useState(b1?.id);
  const [updatedB2, setUpdatedB2] = useState(b2?.id);

  const toggleIsEditing = useCallback(() => setIsEditing((last) => !last), []);
  const cancelUpdatedFields = useCallback(() => {
    setUpdatedCard(card);
    setUpdatedB1(b1?.id);
    setUpdatedB2(b2?.id);
    toggleIsEditing();
  }, [b1, b2, card, toggleIsEditing]);
  const updateTicket = useCallback(() => {
    if (updatedCard) {
      update({ card: updatedCard, b1: updatedB1, b2: updatedB2 });
      toggleIsEditing();
    }
  }, [toggleIsEditing, update, updatedB1, updatedB2, updatedCard]);

  if (isEditing) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={3}>
          <Input
            value={updatedCard}
            onChange={(e) => setUpdatedCard(e.target.value)}
          />
        </TableCell>
        <TableCell>
          <Select
            onValueChange={(value) => setUpdatedB1(value)}
            defaultValue={updatedB1 ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um B1"></SelectValue>
            </SelectTrigger>
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
        </TableCell>
        <TableCell>
          <Select
            onValueChange={(value) => setUpdatedB2(value)}
            defaultValue={updatedB2 ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um B2"></SelectValue>
            </SelectTrigger>
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
        </TableCell>
        <TableCell>
          <Button size={"icon"} variant={"ghost"} onClick={updateTicket}>
            <FaSave />
          </Button>
          <Button size={"icon"} variant={"ghost"} onClick={cancelUpdatedFields}>
            <FaArrowLeft />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={3}>{card}</TableCell>
      <TableCell>{b1?.name}</TableCell>
      <TableCell>{b2?.name}</TableCell>
      <TableCell className="flex gap-2" colSpan={1}>
        <Button size={"icon"} variant={"ghost"} onClick={toggleIsEditing}>
          <FaPencil />
        </Button>
        <Button size={"icon"} variant={"ghost"} onClick={remove}>
          <FaTrash />
        </Button>
      </TableCell>
    </TableRow>
  );
}
