"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { DataTable } from "~/components/ui/data-table";

import { useTicketTable } from "~/hooks/useTicketTable";

export function ClosedTicketsTable() {
  const { columns, data, editingRows, paginationStates, total } =
    useTicketTable({ isClosed: true });

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <h3 className="flex w-full justify-center gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
            Chamados em fechados
          </h3>
        </AccordionTrigger>
        <AccordionContent>
          <DataTable
            columns={columns}
            data={data}
            editingRows={editingRows}
            paginationStates={paginationStates}
            total={total}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
