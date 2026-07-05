import { Check } from "lucide-react";
import { MarketingPricingCards } from "@/components/MarketingPricingCards";
import type { PlanName } from "@/lib/plans";
import { cn } from "@/lib/utils";

const SectionBadge = ({
  label,
  text,
  mobileText,
}: {
  label: string;
  text: string;
  mobileText?: string;
}) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span className={mobileText ? "hidden sm:inline" : "inline"}>{text}</span>
      {mobileText && <span className="inline sm:hidden">{mobileText}</span>}
    </span>
  </div>
);

const VARIANT_DEFAULTS = {
  tool: {
    title: "Pay Less, Post More",
    titleClassName: "text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4",
    descriptionClassName:
      "text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold",
    headerClassName: "text-center mb-16",
    showTrustStrip: true,
    sectionClassName: "",
  },
  platform: {
    title: "Plans and pricing",
    titleClassName: "text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4",
    descriptionClassName: "text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed",
    headerClassName: "flex flex-col items-center text-center mb-14",
    showTrustStrip: false,
    sectionClassName: "mb-20",
  },
} as const;

export type FreeToolPricingSectionProps = {
  onCtaClick?: (planName: PlanName) => void;
  description?: string;
  variant?: keyof typeof VARIANT_DEFAULTS;
  title?: string;
  className?: string;
};

export function FreeToolPricingSection({
  onCtaClick,
  description,
  variant = "tool",
  title,
  className,
}: FreeToolPricingSectionProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const resolvedDescription =
    description ??
    (variant === "tool"
      ? "Start single composer free, toggle annual billing modes to activate active saver rewards."
      : undefined);

  return (
    <section
      id="pricing"
      className={cn(
        "bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10",
        defaults.sectionClassName,
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className={defaults.headerClassName}>
          <SectionBadge label="Pricing" text="Simple pricing for all your needs" mobileText="Simple pricing" />
          <h2 className={defaults.titleClassName}>{title ?? defaults.title}</h2>
          {resolvedDescription && (
            <p className={defaults.descriptionClassName}>{resolvedDescription}</p>
          )}
        </div>

        <MarketingPricingCards onCtaClick={onCtaClick} billingToggleClassName="mb-10" />

        {defaults.showTrustStrip && (
          <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-border/40 text-muted-foreground text-center">
            <Check className="w-4 h-4 shrink-0" />
            <p className="text-[10px] font-bold tracking-[0.15em] leading-relaxed">
              Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
