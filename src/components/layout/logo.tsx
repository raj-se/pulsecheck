import { cn } from "@/lib/utils";

export function PulseMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-5 w-5", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" className="fill-primary/10 stroke-primary/30" />
      <path
        d="M5 17h4.2l2-6 4 14 3.2-13 2 5H27"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PulseMark />
      {!iconOnly && <span className="text-[15px] font-semibold tracking-tight">PulseCheck</span>}
    </span>
  );
}
