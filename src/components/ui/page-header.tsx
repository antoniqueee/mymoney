import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
}

function PageHeader({ title, description, eyebrow, action, actions, children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)} {...props}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-label font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p> : null}
        <h1 className="font-brand text-page-title font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        {children}
      </div>
      {action || actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action ?? actions}</div> : null}
    </div>
  );
}

export { PageHeader };
