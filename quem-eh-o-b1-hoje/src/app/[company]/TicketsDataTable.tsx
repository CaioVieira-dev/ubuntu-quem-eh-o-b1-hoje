import { DataTable } from "~/components/ui/data-table";
import { useTicketTable } from "~/hooks/useTicketTable";

export function TicketsDataTable() {
  const { columns, data, editingRows, paginationStates, total } =
    useTicketTable({ isClosed: false });

  return (
    <DataTable
      columns={columns}
      data={data}
      editingRows={editingRows}
      paginationStates={paginationStates}
      total={total}
    />
  );
}
