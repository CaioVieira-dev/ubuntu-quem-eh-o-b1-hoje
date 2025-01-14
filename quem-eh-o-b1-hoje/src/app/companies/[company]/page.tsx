import { LastTimeAsB1Table } from "./LastTimeAsB1Table";
import { ActiveTicketsTable } from "./ActiveTicketsTable";
import { ClosedTicketsTable } from "./ClosedTicketsTable";
import { Configs } from "./Configs";
import { auth } from "~/server/auth";
import { Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { TableSkeleton } from "./TableSkeleton";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

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
        <h1 className="flex w-full items-center gap-2 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <Link
            href={`/`}
            className="rounded-xl p-2 transition-colors hover:bg-white hover:text-primary"
          >
            <FaArrowLeft />
          </Link>{" "}
          {`Quem é o B1 do ${company} hoje?`}
        </h1>
        {session?.user.id && <Configs userId={session?.user.id} />}
      </div>

      <Suspense fallback={<TableSkeleton isOpen />}>
        <ErrorBoundary>
          <ActiveTicketsTable />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <ErrorBoundary>
          <LastTimeAsB1Table />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <ErrorBoundary>
          <ClosedTicketsTable />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
