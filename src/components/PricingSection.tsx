import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MarketingPricingCards } from "@/components/MarketingPricingCards";
import { pricingCardHover } from "@/lib/marketingButtons";

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to write, schedule, and grow across every platform. All plans include our core AI features.
          </p>
        </div>

        <MarketingPricingCards billingToggleClassName="mb-10" />

        {/* Lifetime Deal Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <Card className={cn("relative border-2 border-black dark:border-white rounded-none bg-[#fffbf9] dark:bg-[#1b1512] overflow-hidden w-full", pricingCardHover)}>
            {/* Banner at the top */}
            <div className="bg-[#d75a34] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wider uppercase border-b-2 border-black flex items-center justify-center gap-1.5 shadow-sm">
              <span>⚠️ Limited Offer: Strictly limited to the first 50 people</span>
            </div>

            <div className="absolute top-10 right-0">
              <span className="bg-[#d75a34] text-white px-4 py-1.5 border-b-2 border-l-2 border-black rounded-none text-xs font-bold uppercase tracking-wider">
                Best Value Deal
              </span>
            </div>

            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-neutral-100">Lifetime Access</h3>
                  <p className="text-gray-600 dark:text-neutral-400 max-w-lg">
                    Pay once, use forever. Get unlimited access to all current and future ShipOS features.
                  </p>
                  <ul className="space-y-2">
                    {["All Pro features included", "Lifetime updates", "Priority support", "No recurring fees"].map((item) => (
                      <li key={item} className="flex items-center text-gray-700 dark:text-neutral-300">
                        <Check className="w-5 h-5 text-[#d75a34] mr-3 flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="mb-4">
                    <span className="text-5xl font-black text-gray-900 dark:text-neutral-100">$299</span>
                    <span className="text-gray-500 dark:text-neutral-400 ml-2">one-time</span>
                  </div>
                  <Button className="w-full md:w-auto text-base font-extrabold" variant="marketing" asChild>
                    <Link to="/pricing">Claim Lifetime Deal</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
