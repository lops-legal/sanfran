import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

/** Seção de página: ritmo vertical fixo e, opcionalmente, faixa de fundo sutil. */
export function Section({
  children,
  band = false,
  id,
  className,
}: {
  children: React.ReactNode;
  band?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={clsx("py-16 md:py-24 scroll-mt-16", band && "bg-subtle/40 dark:bg-subtle/30", className)}>
      <div className="max-w-6xl mx-auto px-4">{children}</div>
    </section>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-3xl font-semibold tracking-tight mb-4 text-balance">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground text-pretty">{subtitle}</p>}
    </div>
  );
}

export function IconCircle({ icon: Icon, size = "md" }: { icon: LucideIcon; size?: "md" | "lg" }) {
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-full border border-border bg-background shrink-0",
        size === "lg" ? "w-12 h-12" : "w-10 h-10",
      )}
    >
      <Icon className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} aria-hidden />
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  children,
  href,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <IconCircle icon={icon} />
      <h3 className="font-medium text-base">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </>
  );
  const cls = "flex flex-col gap-3 p-5 rounded-lg border border-border bg-card";
  return href ? (
    <Link href={href} className={clsx(cls, "hover:border-foreground/25 transition-colors")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

type PillProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  external?: boolean;
};

export function PillLink({ href, children, variant = "secondary", icon: Icon, external }: PillProps) {
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-foreground/[0.045] hover:bg-foreground/10",
  );
  const content = (
    <>
      {Icon && <Icon className="w-4 h-4" aria-hidden />}
      {children}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-sm text-muted-foreground">
      {children}
    </div>
  );
}
