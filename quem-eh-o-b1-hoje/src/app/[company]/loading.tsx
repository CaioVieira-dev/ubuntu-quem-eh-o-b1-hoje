import { Skeleton } from "~/components/ui/skeleton";
import { TableSkeleton } from "./TableSkeleton";

//https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <LoadingSkeleton />;
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16">
        <Skeleton className="h-24 w-full rounded-lg" />
        <TableSkeleton isOpen />
        <TableSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}
