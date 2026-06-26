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
      </div>
    </section>
  );
};
