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
import { showErrorToast, showSuccessToast } from "~/lib/toasts-helpers";
import { CreateTicketForm } from "./CreateTicketForm";
import { TicketsDataTable } from "./TicketsDataTable";

export function ActiveTicketsTable() {
  const utils = api.useUtils();
  const [activeTickets] = api.ticket.getCompanyTickets.useSuspenseQuery({
    isClosed: false,
  });

  const [users] = api.user.getUsers.useSuspenseQuery();

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

  const updateTicket = useCallback(
    (
      newTicket: {
        card: string;
        b1Id?: string | null | undefined;
        b2Id?: string | null | undefined;
      },
      updatedTicketId: number,
    ) => {
      const oldTicket = activeTickets.result.find(
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
            <TicketsDataTable />
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
                {activeTickets.result?.map(
                  ({ b1, b2, card, ticketId, cardName }) => (
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
                  ),
                )}
              </TableBody>
            </Table>
            <CreateTicketForm />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
