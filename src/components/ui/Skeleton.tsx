import React from "react";
import { cn } from "@/libs/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-neutral-800/60 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl flex flex-col justify-between h-40"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-5 w-44 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4 pb-3 border-b border-neutral-800/40">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} className="h-7 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl space-y-6">
      <div className="space-y-2 text-center pb-4 border-b border-neutral-800/60">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <div className="pt-4 flex gap-4 justify-end">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  );
}
