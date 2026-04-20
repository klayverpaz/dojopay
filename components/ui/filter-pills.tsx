"use client";

import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              active
                ? "border-accent bg-accent text-accent-foreground font-semibold"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-accent-foreground/15" : "bg-foreground/10",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
