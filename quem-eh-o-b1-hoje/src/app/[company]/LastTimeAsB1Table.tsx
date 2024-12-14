import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { FaArrowDown } from "react-icons/fa6";

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

export function LastTimeAsB1Table() {
  return (
    <>
      <h3 className="flex gap-2 text-xl font-extrabold tracking-tight sm:text-[2rem]">
        <FaArrowDown />
        Historico <FaArrowDown />
      </h3>
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
    </>
  );
}
