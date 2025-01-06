import { Skeleton } from "~/components/ui/skeleton";

export function TableSkeleton({ isOpen }: { isOpen?: boolean }) {
  return (
    <div className="flex w-full grow flex-col space-y-2">
      <Skeleton className="h-14 w-full rounded-lg" />
      {isOpen && (
        <>
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </>
      )}
    </div>
  );
}

function SkeletonLine() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}
