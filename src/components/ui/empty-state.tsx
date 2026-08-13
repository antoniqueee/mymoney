import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  compact?: boolean;
}

function EmptyState({ title, description, icon: Icon = Inbox, action, compact = false, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 px-5 text-center", compact ? "min-h-40 py-7" : "min-h-56 py-10", className)} {...props}>
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="font-brand text-xl font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
