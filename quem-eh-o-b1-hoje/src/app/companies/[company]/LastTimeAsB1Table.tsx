"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function LastTimeAsB1Table() {
  const [lastTimeOfUsersAsB1OrB2] =
    api.user.getLastTimeInTicketAsB1AndB2.useSuspenseQuery();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <h3 className="flex w-full justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
            Ultima vez como b1
          </h3>
        </AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>Nome</TableHead>
                <TableHead>Nº vezes como B1</TableHead>
                <TableHead>Ultima vez como B1</TableHead>
                <TableHead>Nº vezes como B2</TableHead>
                <TableHead>Ultima vez como B2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lastTimeOfUsersAsB1OrB2?.map?.(
                ({
                  id,
                  lastTimeAsB1,
                  lastTimeAsB2,
                  name,
                  timesAsB1,
                  timesAsB2,
                  profilePicture,
                }) => (
                  <TableRow key={id}>
                    <TableCell>
                      {
                        <Avatar>
                          <AvatarImage
                            src={profilePicture ?? ""}
                            alt="Foto do usuário"
                          />
                          <AvatarFallback className="bg-slate-500">
                            {getInitials(name ?? "AV")}
                          </AvatarFallback>
                        </Avatar>
                      }
                    </TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{timesAsB1 ?? "-"}</TableCell>
                    <TableCell suppressHydrationWarning>
                      {lastTimeAsB1
                        ? new Date(lastTimeAsB1).toLocaleString()
                        : "Ainda não"}
                    </TableCell>
                    <TableCell>{timesAsB2 ?? "-"}</TableCell>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (
      (parts[0]?.charAt(0).toUpperCase() ?? "") +
      (parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "")
    );
  }

  return (
    parts[0]?.charAt(0).toUpperCase() ??
    "" + parts[0]?.charAt(1).toUpperCase() ??
    ""
  );
}
