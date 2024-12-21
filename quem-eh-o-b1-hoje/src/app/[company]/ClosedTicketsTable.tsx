"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { OpenTicketRow } from "./OpenTicketRow";

export function ClosedTicketsTable() {
  const utils = api.useUtils();
  const [activeTickets] = api.ticket.getCompanyTickets.useSuspenseQuery({
    isClosed: true,
  });
  const [users] = api.user.getUsers.useSuspenseQuery();

  const { mutate: update } = api.ticket.update.useMutation({
    async onSuccess() {
      await utils.ticket.invalidate();
      await utils.user.invalidate();
    },
  });
  const { mutate: reopenTicketMutation } = api.ticket.reopenTicket.useMutation({
    async onSuccess() {
      await utils.ticket.invalidate();
      await utils.user.invalidate();
    },
  });
  const { mutate: deleteTicket } = api.ticket.remove.useMutation({
    async onSuccess() {
      await utils.ticket.invalidate();
      await utils.user.invalidate();
    },
  });

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
          updatedTicket.b2Id = b1Id === "null" ? null : parseInt(b2Id!, 10);
        }

        update({ ...updatedTicket, ticketId: updatedTicketId });
      }
    },
    [activeTickets, update],
  );
  const reopenTicket = useCallback(
    (ticketId: number) => reopenTicketMutation({ ticketId }),
    [reopenTicketMutation],
  );
  const removeTicket = useCallback(
    (ticketId: number) => {
      deleteTicket({ ticketId });
    },
    [deleteTicket],
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <h3 className="flex w-full justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
            Chamados em fechados
          </h3>
        </AccordionTrigger>
        <AccordionContent>
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
                  reopenTicket={() => reopenTicket(ticketId)}
                  remove={() => removeTicket(ticketId)}
                />
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
