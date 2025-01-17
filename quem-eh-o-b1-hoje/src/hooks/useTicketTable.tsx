import { useCallback, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCheckDouble, FaPencil, FaTrash } from "react-icons/fa6";
import { FaSave, FaSync, FaUndoAlt } from "react-icons/fa";
import { TbClockEdit } from "react-icons/tb";

import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { showErrorToast, showSuccessToast } from "~/lib/toasts-helpers";
type bType = {
  name: string | null | undefined;
  id: number | null;
};
interface DataItem {
  b1: bType;
  b2: bType;
  card: string;
  cardName: string;
  ticketId: number;
  b1UpdatedAt: Date | null;
  b2UpdatedAt: Date | null;
}

export function useTicketTable({ isClosed }: { isClosed: boolean }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const utils = api.useUtils();
  const [activeTickets] = api.ticket.getCompanyTickets.useSuspenseQuery({
    isClosed,
    page,
    pageSize,
  });

  const totalPages = Math.ceil((activeTickets?.total ?? 0) / pageSize);

  const [users] = api.user.getUsers.useSuspenseQuery();
  const possibleB1Users = useMemo(
    () => users.filter((user) => user.canBeB1),
    [users],
  );
  const possibleB2Users = useMemo(
    () => users.filter((user) => user.canBeB2),
    [users],
  );
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
  const { mutate: reopenTicketMutation } = api.ticket.reopenTicket.useMutation({
    async onSuccess() {
      showSuccessToast("Card reaberto com sucesso");
      await utils.ticket.invalidate();
      await utils.user.invalidate();
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

  const isSaving =
    isUpdatingTicket ||
    isClosingTicket ||
    isRefreshingTicketName ||
    isDeletingTicket;

  // Estado para controlar linhas em edição
  const [editingRows, setEditingRows] = useState<Record<number, boolean>>({});

  // Estado para armazenar alterações temporárias
  const [tempData, setTempData] = useState<Record<string, Partial<DataItem>>>(
    {},
  );

  // Função para iniciar edição
  const startEditing = (id: number) => {
    setEditingRows((prev) => ({ ...prev, [id]: true }));
    // Inicializa os dados temporários com os valores atuais
    const rowData = activeTickets.result.find((item) => item.ticketId === id);
    setTempData((prev) => ({ ...prev, [id]: { ...rowData } }));
  };

  // Função para salvar alterações
  const saveChanges = (id: number) => {
    const oldTicket = activeTickets.result.find(
      ({ ticketId }) => ticketId === id,
    );

    if (oldTicket) {
      const { card, b1, b2, b1UpdatedAt, b2UpdatedAt } = tempData[id] as {
        b1: bType | "null";
        b2: bType | "null";
        card: string;
        cardName: string;
        ticketId: number;
        b1UpdatedAt?: Date;
        b2UpdatedAt?: Date;
      };
      const updatedTicket: {
        card: string;
        b1Id?: number | null | undefined;
        b2Id?: number | null | undefined;
        b1UpdatedAt?: Date;
        b2UpdatedAt?: Date;
      } = {
        card,
      };

      if (b1 === "null" && oldTicket?.b1?.id) {
        updatedTicket.b1Id = null;
      } else if (b1 !== "null" && b1.id !== oldTicket?.b1?.id) {
        updatedTicket.b1Id = b1.id;
      }
      if (b2 === "null" && oldTicket?.b2?.id) {
        updatedTicket.b2Id = null;
      } else if (b2 !== "null" && b2.id !== oldTicket?.b2?.id) {
        updatedTicket.b2Id = b2.id;
      }

      if (b1UpdatedAt) {
        updatedTicket.b1UpdatedAt = new Date(b1UpdatedAt);
      }

      if (b2UpdatedAt) {
        updatedTicket.b2UpdatedAt = new Date(b2UpdatedAt);
      }

      update({ ...updatedTicket, ticketId: id });
    }

    setEditingRows((prev) => ({ ...prev, [id]: false }));
    setTempData((prev) => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  // Função para cancelar edição
  const cancelEditing = (id: number) => {
    setEditingRows((prev) => ({ ...prev, [id]: false }));
    setTempData((prev) => {
      const newTemp = { ...prev };
      delete newTemp[id];
      return newTemp;
    });
  };

  // Função para atualizar dados temporários
  const updateTempData = (id: number, field: string, value: unknown) => {
    setTempData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const updateTicketName = useCallback(
    (ticketId: number) => refreshTicketNameMutation({ ticketId }),
    [refreshTicketNameMutation],
  );
  const closeTicket = useCallback(
    (ticketId: number) => closeTicketMutation({ ticketId }),
    [closeTicketMutation],
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

  const columns: ColumnDef<DataItem>[] = [
    {
      accessorKey: "cardName",
      header: "Card",
      meta: {
        colSpan: 3,
      },
      cell: ({ row }) => {
        const isEditing = editingRows[row.original.ticketId];
        const value = isEditing
          ? tempData[row.original.ticketId]?.card
          : row.getValue("cardName");

        return isEditing ? (
          <Input
            value={value as string}
            onChange={(e) => {
              updateTempData(row.original.ticketId, "card", e.target.value);
            }}
            disabled={isSaving}
          />
        ) : (
          <span className={`${isSaving ? "text-white/50" : ""}`}>
            {value as string}
          </span>
        );
      },
    },
    {
      accessorKey: "b1",
      header: "B1",
      cell: ({ row }) => {
        const isEditing = editingRows[row.original.ticketId];

        if (isEditing) {
          const value = tempData[row.original.ticketId]?.b1?.id;
          const timeValue = tempData[row.original.ticketId]?.b1UpdatedAt;

          return (
            <div className="flex">
              <Select
                value={`${value}`}
                onValueChange={(newValue) => {
                  updateTempData(
                    row.original.ticketId,
                    "b1",
                    users.find((u) => u?.id === parseInt(newValue, 10)) ??
                      "null",
                  );
                }}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={-1} value={"null"}>
                    <span className="w-100 p-3"></span>
                  </SelectItem>

                  {possibleB1Users.map(({ id, name }) => (
                    <SelectItem key={id} value={`${id}`}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePicker
                ticketId={row.original.ticketId}
                timeValue={timeValue}
                updateTempData={updateTempData}
                fieldName="b1UpdatedAt"
              />
            </div>
          );
        }

        const value: bType = row.getValue("b1");

        return (
          <span className={`${isSaving ? "text-white/50" : ""}`}>
            {value.name}
          </span>
        );
      },
    },
    {
      accessorKey: "b2",
      header: "B2",
      cell: ({ row }) => {
        const isEditing = editingRows[row.original.ticketId];

        if (isEditing) {
          const value = tempData[row.original.ticketId]?.b2?.id;
          const timeValue = tempData[row.original.ticketId]?.b2UpdatedAt;

          return (
            <div className="flex">
              <Select
                value={`${value}`}
                onValueChange={(newValue) => {
                  updateTempData(
                    row.original.ticketId,
                    "b2",
                    users.find((u) => u?.id === parseInt(newValue, 10)) ??
                      "null",
                  );
                }}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={-1} value={"null"}>
                    <span className="w-100 p-3"></span>
                  </SelectItem>

                  {possibleB2Users.map(({ id, name }) => (
                    <SelectItem key={id} value={`${id}`}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePicker
                ticketId={row.original.ticketId}
                timeValue={timeValue}
                updateTempData={updateTempData}
                fieldName="b2UpdatedAt"
              />
            </div>
          );
        }

        const value: bType = row.getValue("b2");

        return (
          <span className={`${isSaving ? "text-white/50" : ""}`}>
            {value.name}
          </span>
        );
      },
    },
    {
      header: "Ações",
      id: "actions",
      cell: ({ row }) => {
        const isEditing = editingRows[row.original.ticketId];

        return isEditing ? (
          <div className="flex gap-2">
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={() => saveChanges(row.original.ticketId)}
              disabled={isSaving}
              title="Salvar"
            >
              <FaSave />
            </Button>
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={() => cancelEditing(row.original.ticketId)}
              disabled={isSaving}
              title="Cancelar"
            >
              <FaArrowLeft />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => startEditing(row.original.ticketId)}
              size={"icon"}
              variant={"ghost"}
              title="Editar"
            >
              <FaPencil />
            </Button>
            {updateTicketName && (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => updateTicketName(row.original.ticketId)}
                disabled={isSaving}
                title="Sincronizar nome"
              >
                <FaSync />
              </Button>
            )}
            {isClosed ? (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => reopenTicket(row.original.ticketId)}
                disabled={isSaving}
                title="Reabrir"
              >
                <FaUndoAlt />
              </Button>
            ) : (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => closeTicket(row.original.ticketId)}
                disabled={isSaving}
                title="Fechar"
              >
                <FaCheckDouble />
              </Button>
            )}
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={() => removeTicket(row.original.ticketId)}
              disabled={isSaving}
              title="Excluir"
            >
              <FaTrash />
            </Button>
          </div>
        );
      },
    },
  ];

  return {
    columns,
    data: activeTickets.result,
    editingRows,
    paginationStates: {
      page,
      pageSize,
      setPage,
      setPageSize,
    },
    total: totalPages,
  };
}

function DatePicker({
  ticketId,
  timeValue,
  updateTempData,
  fieldName,
}: {
  timeValue: Date | null | undefined;
  updateTempData: (id: number, field: string, value: unknown) => void;
  ticketId: number;
  fieldName: string;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const togglePicker = (): void => {
    if (inputRef.current) {
      if (isPickerOpen) {
        inputRef.current.blur();
        setIsPickerOpen(false);
      } else {
        inputRef.current.focus();
        inputRef.current.showPicker?.();
        setIsPickerOpen(true);
      }
    }
  };
  return (
    <div className="relative inline-block">
      <Button
        onClick={togglePicker}
        variant={"ghost"}
        size={"icon"}
        title="Editar data de inclusão"
      >
        <TbClockEdit />
      </Button>
      <input
        ref={inputRef}
        value={timeValue !== null ? (timeValue as unknown as string) : ""}
        onChange={(e) => updateTempData(ticketId, fieldName, e.target.value)}
        type="datetime-local"
        className="absolute h-full w-0 cursor-pointer opacity-0"
      />
    </div>
  );
}
