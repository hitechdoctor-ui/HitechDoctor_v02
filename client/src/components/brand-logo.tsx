import { cn } from "@/lib/utils";

const LOGO_LIGHT = "/images/hitechdoctor-logo-light.png?v=4";
const LOGO_DARK = "/images/hitechdoctor-logo-dark.png?v=4";

type Props = {
  className?: string;
  alt?: string;
  /** Decorative (empty alt) when next to visible brand text */
  decorative?: boolean;
};

/**
 * Brand mark with light + dark variants:
 * - light bg → black details + red
 * - dark bg → white details + red
 */
export function BrandLogo({ className, alt = "HitechDoctor Logo", decorative }: Props) {
  const a = decorative ? "" : alt;
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      <img
        src={LOGO_LIGHT}
        alt={a}
        className="h-full w-full object-contain dark:hidden"
        decoding="async"
      />
      <img
        src={LOGO_DARK}
        alt={a}
        className="hidden h-full w-full object-contain dark:block"
        decoding="async"
        aria-hidden={decorative ? true : undefined}
      />
    </span>
  );
}
