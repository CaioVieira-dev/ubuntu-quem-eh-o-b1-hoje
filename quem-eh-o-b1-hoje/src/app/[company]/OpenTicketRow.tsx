"use client";

import { FaArrowLeft, FaCheckDouble, FaPencil, FaTrash } from "react-icons/fa6";
import { FaSave, FaSync, FaUndoAlt } from "react-icons/fa";
import { Input } from "~/components/ui/input";

import { TableCell, TableRow } from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "~/components/ui/button";
import { useCallback, useState } from "react";

export function OpenTicketRow({
  card,
  cardName,
  b1,
  b2,
  users,
  update,
  closeTicket,
  reopenTicket,
  updateTicketName,
  remove,
  isSaving,
}: {
  card: string;
  cardName?: string;
  b1?: { name: string | null | undefined; id: number | null };
  b2?: { name: string | null | undefined; id: number | null };
  users: { name: string; id: number }[];
  update: (updatedTicket: {
    card: string;
    b1Id?: string | null | undefined;
    b2Id?: string | null | undefined;
  }) => void;
  isSaving?: boolean;
  updateTicketName?: () => void;
  closeTicket?: () => void;
  reopenTicket?: () => void;
  remove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCard, setUpdatedCard] = useState(card);
  const [updatedb1, setUpdatedb1] = useState(`${b1?.id}`);
  const [updatedb2, setUpdatedb2] = useState(`${b2?.id}`);

  const toggleIsEditing = useCallback(() => setIsEditing((last) => !last), []);
  const cancelUpdatedFields = useCallback(() => {
    setUpdatedCard(card);
    setUpdatedb1(`${b1?.id}`);
    setUpdatedb2(`${b2?.id}`);
    toggleIsEditing();
  }, [b1, b2, card, toggleIsEditing]);
  const updateTicket = useCallback(() => {
    if (updatedCard) {
      update({ card: updatedCard, b1Id: updatedb1, b2Id: updatedb2 });
      toggleIsEditing();
    }
  }, [toggleIsEditing, update, updatedb1, updatedb2, updatedCard]);

  if (isEditing) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={3}>
          <Input
            value={updatedCard}
            onChange={(e) => setUpdatedCard(e.target.value)}
            disabled={isSaving}
          />
        </TableCell>
        <TableCell>
          <Select
            onValueChange={(value) => setUpdatedb1(value)}
            defaultValue={updatedb1 ? `${updatedb1}` : ""}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um b1"></SelectValue>
            </SelectTrigger>
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
        </TableCell>
        <TableCell>
          <Select
            onValueChange={(value) => setUpdatedb2(value)}
            defaultValue={updatedb2 ? `${updatedb2}` : ""}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um b2"></SelectValue>
            </SelectTrigger>
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
        </TableCell>
        <TableCell>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={updateTicket}
            disabled={isSaving}
          >
            <FaSave />
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={cancelUpdatedFields}
            disabled={isSaving}
          >
            <FaArrowLeft />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={3}>{cardName}</TableCell>
      <TableCell>{b1?.name}</TableCell>
      <TableCell>{b2?.name}</TableCell>
      <TableCell className="flex gap-2" colSpan={1}>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={toggleIsEditing}
          disabled={isSaving}
        >
          <FaPencil />
        </Button>
        {updateTicketName && (
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={updateTicketName}
            disabled={isSaving}
          >
            <FaSync />
          </Button>
        )}
        {closeTicket && (
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={closeTicket}
            disabled={isSaving}
          >
            <FaCheckDouble />
          </Button>
        )}
        {reopenTicket && (
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={reopenTicket}
            disabled={isSaving}
          >
            <FaUndoAlt />
          </Button>
        )}
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={remove}
          disabled={isSaving}
        >
          <FaTrash />
        </Button>
      </TableCell>
    </TableRow>
  );
}
