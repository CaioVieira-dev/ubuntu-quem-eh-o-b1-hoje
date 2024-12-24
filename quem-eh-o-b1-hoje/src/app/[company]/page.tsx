import { LastTimeAsB1Table } from "./LastTimeAsB1Table";
import { ActiveTicketsTable } from "./ActiveTicketsTable";
import { ClosedTicketsTable } from "./ClosedTicketsTable";
import { Configs } from "./Configs";
import { auth } from "~/server/auth";

export default async function Company({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const company = (await params).company;
  const session = await auth();

  return (
    <div className="container flex max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex gap-2">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {`Quem é o B1 do ${company} hoje?`}
        </h1>
        {session?.user.id && <Configs userId={session?.user.id} />}
      </div>

      <ActiveTicketsTable />
      <LastTimeAsB1Table />
      <ClosedTicketsTable />
    </div>
  );
}
