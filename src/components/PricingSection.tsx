import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS } from "@/lib/plans";

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

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative border-2 border-black rounded-none ${
                plan.popular 
                  ? 'border-black shadow-[8px_8px_0px_0px_rgba(215,90,52,1)] bg-[#fbf4f2] dark:bg-[#1a1310]' 
                  : 'border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#11100e]'
              } h-full flex flex-col justify-between`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-[#d75a34] text-white px-4 py-1 border-2 border-black rounded-none text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-neutral-100">${plan.price.monthly}</span>
                  <span className="text-gray-600 dark:text-neutral-400">/month</span>
                </div>
                <CardDescription className="mt-4 dark:text-neutral-400">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-[#d75a34] mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-neutral-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full text-base font-extrabold"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lifetime Deal Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <Card className="relative border-2 border-black rounded-none bg-[#fffbf9] dark:bg-[#1b1512] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
            {/* Banner at the top */}
            <div className="bg-[#d75a34] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wider uppercase border-b-2 border-black flex items-center justify-center gap-1.5 shadow-sm">
              <span>⚠️ Limited Offer: Strictly limited to the first 50 people</span>
            </div>

            <div className="absolute top-10 right-0">
              <span className="bg-[#d75a34] text-white px-4 py-1.5 border-b-2 border-l-2 border-black rounded-none text-xs font-bold uppercase tracking-wider">
                Best Value Deal
              </span>
            </div>

            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-left max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-neutral-100 tracking-tight">
                    Lifetime Pro Deal
                  </h3>
                  <span className="bg-[#d75a34]/10 text-[#d75a34] border border-[#d75a34]/30 rounded-none font-bold uppercase tracking-wider text-[10px] py-1 px-2.5">
                    One-Time Payment
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 dark:text-neutral-400 font-medium">
                  Get full, unlimited access to the <strong>Pro Plan</strong> forever. Pay once, use it for life with all future updates, priority support, and no recurring bills, ever. Limited to the first 50 people.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center min-w-[240px] text-center md:text-right shrink-0 bg-white/50 dark:bg-black/20 p-6 border-2 border-dashed border-black/20 dark:border-white/20">
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">One-Time Fee</span>
                  <div className="flex items-baseline justify-center md:justify-end gap-1">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-neutral-100 font-mono">$299</span>
                    <span className="text-sm font-bold text-gray-500 line-through font-mono">$588/yr value</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-extrabold bg-[#d75a34] text-white hover:bg-[#c24b27] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  asChild
                >
                  <Link to="/pricing">Claim Lifetime Deal</Link>
                </Button>
                <span className="text-[9px] text-[#d75a34] font-extrabold mt-2 block uppercase tracking-wider">
                  ⚠️ Only 50 spots available
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
