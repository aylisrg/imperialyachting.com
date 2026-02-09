import { cn } from "@/lib/utils";

type BadgeVariant = "gold" | "sea" | "white";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-gold-500/10 text-gold-400 border-gold-500/20",
  sea: "bg-sea-500/10 text-sea-500 border-sea-500/20",
  white: "bg-white/10 text-white/80 border-white/10",
};

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
