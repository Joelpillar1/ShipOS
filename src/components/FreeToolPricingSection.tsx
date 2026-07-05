import { Check } from "lucide-react";
import { MarketingPricingCards } from "@/components/MarketingPricingCards";
import type { PlanName } from "@/lib/plans";

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

export type FreeToolPricingSectionProps = {
  onCtaClick?: (planName: PlanName) => void;
  description?: string;
};

export function FreeToolPricingSection({
  onCtaClick,
  description = "Start single composer free, toggle annual billing modes to activate active saver rewards.",
}: FreeToolPricingSectionProps) {
  return (
    <section id="pricing" className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge label="Pricing" text="Simple pricing for all your needs" mobileText="Simple pricing" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Pay Less, Post More
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold">
            {description}
          </p>
        </div>

        <MarketingPricingCards onCtaClick={onCtaClick} billingToggleClassName="mb-10" />

        <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-border/40 text-muted-foreground text-center">
          <Check className="w-4 h-4 shrink-0" />
          <p className="text-[10px] font-bold tracking-[0.15em] leading-relaxed">
            Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
          </p>
        </div>
      </div>
    </section>
  );
}
