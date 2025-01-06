"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "~/components/ui/button";
import { useCallback, useState } from "react";

import { api } from "~/trpc/react";
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

export function CreateTicketForm() {
  const [selectKey, setSelectKey] = useState(+new Date());
  const utils = api.useUtils();

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
  const addNewTicket = useCallback(
    (newTicket: z.infer<typeof formSchema>) => {
      return createTicket(newTicket);
    },
    [createTicket],
  );

  return (
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
                        defaultValue={field.value ? `${field.value}` : ""}
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
                        defaultValue={field.value ? `${field.value}` : ""}
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
  );
}
