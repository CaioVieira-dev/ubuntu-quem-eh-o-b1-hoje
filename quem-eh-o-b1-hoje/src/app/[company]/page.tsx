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
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "~/components/ui/button";

const ultimaVezComoB1EB2 = [
  {
    name: "caio",
    lastTimeAsB1: "2024-12-01T15:00:20.000Z",
    lastTimeAsB2: "2024-11-28T15:00:20.000Z",
    id: 1,
  },
  {
    name: "ramon",
    lastTimeAsB2: "2024-11-28T15:00:20.000Z",
    id: 2,
  },
  {
    name: "heitor",
    lastTimeAsB1: "2024-12-01T15:00:20.000Z",
    id: 3,
  },
];

const atendimentosAtivos = [
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

const usuarios = [
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

export default function Company() {
  const params = useParams<{ company: string }>();
  const company = params.company;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      card: "",
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {`Quem é o B1 do ${company} hoje?`}
        </h1>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>Nome</TableHead>
              <TableHead>Ultima vez como B1</TableHead>
              <TableHead>Ultima vez como B2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ultimaVezComoB1EB2.map(
              ({ id, lastTimeAsB1, lastTimeAsB2, name }) => (
                <TableRow key={id}>
                  <TableCell>AV </TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell suppressHydrationWarning>
                    {lastTimeAsB1
                      ? new Date(lastTimeAsB1).toLocaleString()
                      : "Ainda não"}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {lastTimeAsB2
                      ? new Date(lastTimeAsB2).toLocaleString()
                      : "Ainda não"}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
        <h3 className="flex gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
          <FaArrowDown />
          Chamados em aberto <FaArrowDown />
        </h3>
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
            {atendimentosAtivos.map(({ id, b1, b2, card }) => (
              <TableRow key={id}>
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
            <TableRow key={"new-ticket"} className="hover:bg-transparent">
              <Form {...form}>
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
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um B1"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {usuarios.map(({ id, name }) => (
                                <SelectItem key={id} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um B2"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {usuarios.map(({ id, name }) => (
                                <SelectItem key={id} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                </TableCell>
                <TableCell></TableCell>
              </Form>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
