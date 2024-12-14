"use client";

import { useForm } from "react-hook-form";
import { FaArrowDown, FaPencil, FaTrash } from "react-icons/fa6";
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

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
      //little hack to return selects to the placeholder text
      setSelectKey(+new Date());
    }
  }, [form, form.formState.isSubmitSuccessful]);
  console.log(selectKey);
  return (
    <>
      <h3 className="flex gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
        <FaArrowDown />
        Chamados em aberto <FaArrowDown />
      </h3>
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
              <TableRow key={`${card}-${index}`}>
                <TableCell colSpan={3}>{card}</TableCell>
                <TableCell>{b1}</TableCell>
                <TableCell>{b2}</TableCell>
                <TableCell className="flex gap-2" colSpan={1}>
                  <Button size={"icon"} variant={"ghost"}>
                    <FaPencil />
                  </Button>
                  <Button size={"icon"} variant={"ghost"}>
                    <FaTrash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addNewTicket)}>
            <Table className="table-fixed">
              <TableBody>
                <TableRow key={"new-ticket"} className="hover:bg-transparent">
                  <TableCell colSpan={3}>
                    <FormField
                      name="card"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Preencha o link do card"
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
    </>
  );
}
