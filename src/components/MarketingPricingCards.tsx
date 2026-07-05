import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { PLANS, type PlanName } from "@/lib/plans";
import { cn } from "@/lib/utils";
import {
  pricingCardClass,
  pricingCardPopularClass,
  pricingGridClass,
  pricingCardWrapperClass,
  pricingPriceRowClass,
  pricingButtonClass,
} from "@/lib/marketingButtons";

export function MarketingPricingBillingToggle({
  isAnnual,
  onAnnualChange,
  className,
}: {
  isAnnual: boolean;
  onAnnualChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 bg-muted/80 border border-border rounded-none p-1 w-fit mx-auto shadow-sm",
        className
      )}
    >
      <span
        className={cn(
          "text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer",
          !isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
        )}
        onClick={() => onAnnualChange(false)}
      >
        Monthly
      </span>
      <Switch
        checked={isAnnual}
        onCheckedChange={onAnnualChange}
        className="data-[state=checked]:bg-primary"
      />
      <span
        className={cn(
          "text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer flex items-center",
          isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
        )}
        onClick={() => onAnnualChange(true)}
      >
        Annual Billing
        <Badge className="bg-primary/15 text-primary border-transparent rounded-none text-[8.5px] font-bold py-0.5 px-2 ml-2 shadow-none">
          Save 20%
        </Badge>
      </span>
    </div>
  );
}

export type MarketingPricingCardsProps = {
  onCtaClick?: (planName: PlanName) => void;
  busyPlan?: string | null;
  animate?: boolean;
  showBillingToggle?: boolean;
  billingToggleClassName?: string;
  isAnnual?: boolean;
  onAnnualChange?: (value: boolean) => void;
  className?: string;
};

function PricingPlanCard({
  plan,
  isAnnual,
  onCtaClick,
  busyPlan,
}: {
  plan: (typeof PLANS)[number];
  isAnnual: boolean;
  onCtaClick: (planName: PlanName) => void;
  busyPlan?: string | null;
}) {
  const isBusy = busyPlan === plan.name;

  return (
    <Card className={cn(plan.popular ? pricingCardPopularClass : pricingCardClass, "shadow-none")}>
      {plan.badge && (
        <div
          className={cn(
            "absolute top-4 right-4 text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none border border-black dark:border-white shadow-none",
            plan.popular ? "bg-[#d75a34] text-white" : "bg-background text-foreground"
          )}
        >
          {plan.badge}
        </div>
      )}

      <CardContent className="p-8 flex-1 flex flex-col justify-between text-left bg-background/30 w-full">
        <div className="space-y-6 flex-1">
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
          </div>

          <div className={pricingPriceRowClass}>
            {isAnnual ? (
              <div className="flex items-baseline space-x-2 flex-wrap">
                <span className="text-4xl font-bold text-foreground font-mono">${plan.price.annual}</span>
                <span className="text-xs font-semibold text-muted-foreground mr-2">/year</span>
                <span className="text-sm font-medium text-muted-foreground/60 line-through font-mono">
                  ${plan.price.monthly * 12}
                </span>
                <span className="text-[10px] font-bold text-[#d75a34] bg-[#d75a34]/10 px-1.5 py-0.5 rounded-none ml-1">
                  Save 20%
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold text-foreground font-mono">${plan.price.monthly}</span>
                <span className="text-xs font-semibold text-muted-foreground">/month</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold tracking-wider text-muted-foreground block">Includes Features:</span>
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start space-x-2 text-sm font-semibold text-foreground/90">
                <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onCtaClick(plan.name)}
          disabled={isBusy}
          variant={plan.popular ? "marketing" : "marketingOutline"}
          className={pricingButtonClass}
        >
          {isBusy ? (
            "Please wait…"
          ) : (
            <>
              Try it for $0 (7-days)
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function MarketingPricingCards({
  onCtaClick,
  busyPlan,
  animate = false,
  showBillingToggle = true,
  billingToggleClassName,
  isAnnual: controlledAnnual,
  onAnnualChange,
  className,
}: MarketingPricingCardsProps) {
  const navigate = useNavigate();
  const [internalAnnual, setInternalAnnual] = useState(false);
  const isAnnual = controlledAnnual ?? internalAnnual;
  const setIsAnnual = onAnnualChange ?? setInternalAnnual;

  const handleCta = (planName: PlanName) => {
    if (onCtaClick) {
      onCtaClick(planName);
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className={className}>
      {showBillingToggle && (
        <MarketingPricingBillingToggle
          isAnnual={isAnnual}
          onAnnualChange={setIsAnnual}
          className={billingToggleClassName}
        />
      )}

      <div className={cn(pricingGridClass, showBillingToggle && "mt-10")}>
        {PLANS.map((plan, idx) => {
          const card = (
            <PricingPlanCard
              plan={plan}
              isAnnual={isAnnual}
              onCtaClick={handleCta}
              busyPlan={busyPlan}
            />
          );

          if (animate) {
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={pricingCardWrapperClass}
              >
                {card}
              </motion.div>
            );
          }

          return (
            <div key={plan.name} className={pricingCardWrapperClass}>
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
