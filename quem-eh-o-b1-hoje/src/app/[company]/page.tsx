import { LastTimeAsB1Table } from "./LastTimeAsB1Table";
import { ActiveTicketsTable } from "./ActiveTicketsTable";

export default async function Company({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const company = (await params).company;

  return (
    <div className="container flex max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        {`Quem é o B1 do ${company} hoje?`}
      </h1>

      <LastTimeAsB1Table />
      <ActiveTicketsTable />
    </div>
  );
}
