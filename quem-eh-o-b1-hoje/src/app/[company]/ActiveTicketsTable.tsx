"use client";

import { useForm } from "react-hook-form";
import { FaArrowDown, FaArrowLeft, FaPencil, FaTrash } from "react-icons/fa6";
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

const mockAtendimentosAtivos = [
  {
    card: "https://app.clickup.com/t/86a5jxutr",
    b1: "caio",
    b2: "ramon",
    id: 1,
  },
  {
    card: "https://app.clickup.com/t/12a5jxutz",
    b1: "heitor",
    b2: "caio",
    id: 2,
  },
  {
    card: "https://app.clickup.com/t/99a5jxutz",
    b1: "camila",
    b2: "heitor",
    id: 3,
  },
];

const mockUsuarios = [
  { name: "caio", id: 1 },
  { name: "ramon", id: 2 },
  { name: "heitor", id: 3 },
  { name: "camila", id: 4 },
];

const formSchema = z.object({
  card: z.string(),
  b1: z.string().optional(),
  b2: z.string().optional(),
});

export function ActiveTicketsTable() {
  const [selectKey, setSelectKey] = useState(+new Date());
  const [activeTickets, setActiveTickets] = useState<
    z.infer<typeof formSchema>[]
  >(mockAtendimentosAtivos);
  const [users, setUsers] = useState(mockUsuarios);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      card: "",
    },
  });

  const addNewTicket = useCallback((newTicket: z.infer<typeof formSchema>) => {
    setActiveTickets((oldTickets) => {
      return [...oldTickets, newTicket];
    });
  }, []);
  const updateTicket = useCallback(
    (
      newTicket: { card: string; b1?: string; b2?: string },
      updatedIndex: number,
    ) => {
      setActiveTickets((oldTickets) => {
        return oldTickets.map((old, index) =>
          updatedIndex === index ? { ...old, ...newTicket } : old,
        );
      });
    },
    [],
  );
  const removeTicket = useCallback((removedIndex: number) => {
    setActiveTickets((oldTickets) => {
      return oldTickets.filter((old, index) => removedIndex !== index);
    });
  }, []);

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
                {activeTickets.map(({ b1, b2, card }, index) => (
                  <OpenTicketRow
                    key={`${card}-${index}`}
                    card={card}
                    users={users}
                    b1={b1}
                    b2={b2}
                    update={(updatedTicket) =>
                      updateTicket(updatedTicket, index)
                    }
                    remove={() => removeTicket(index)}
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
                                defaultValue={field.value}
                                key={`b2${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um B1"></SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users.map(({ id, name }) => (
                                    <SelectItem key={id} value={name}>
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
                                defaultValue={field.value}
                                key={`b2${selectKey}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um B2"></SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users.map(({ id, name }) => (
                                    <SelectItem key={id} value={name}>
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
  b1?: string;
  b2?: string;
  users: { name: string; id: number }[];
  update: (updatedTicket: { card: string; b1?: string; b2?: string }) => void;
  remove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCard, setUpdatedCard] = useState(card);
  const [updatedB1, setUpdatedB1] = useState(b1);
  const [updatedB2, setUpdatedB2] = useState(b2);

  const toggleIsEditing = useCallback(() => setIsEditing((last) => !last), []);
  const cancelUpdatedFields = useCallback(() => {
    setUpdatedCard(card);
    setUpdatedB1(b1);
    setUpdatedB2(b2);
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
            defaultValue={updatedB1}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um B1"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map(({ id, name }) => (
                <SelectItem key={id} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            onValueChange={(value) => setUpdatedB2(value)}
            defaultValue={updatedB2}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um B2"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map(({ id, name }) => (
                <SelectItem key={id} value={name}>
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
      <TableCell>{b1}</TableCell>
      <TableCell>{b2}</TableCell>
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
