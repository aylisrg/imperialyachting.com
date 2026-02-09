import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-0.5 bg-gold-500 mb-6",
          align === "center" && "mx-auto"
        )}
      />
      <h2
        className={cn(
          "font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
          light ? "text-navy-950" : "text-white"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-lg max-w-2xl leading-relaxed",
            light ? "text-navy-800/70" : "text-white/60",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
