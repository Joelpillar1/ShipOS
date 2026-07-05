import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PLANS, type PlanName } from '@/lib/plans';
import { setPendingDiscount } from '@/lib/billing';

// Presentation-only styling per plan; all pricing/feature DATA comes from the single source of
// truth in @/lib/plans so this page can never drift from /pricing or the backend allowances.
const planStyles: Record<PlanName, { color: string; accent: string }> = {
 Starter: {
 color:"border-border hover:border-foreground/20 hover:shadow-md",
 accent:"bg-muted text-muted-foreground",
 },
 Creator: {
 color:"border-primary/50 shadow-lg hover:shadow-xl scale-105",
 accent:"bg-primary text-white",
 },
 Pro: {
 color:"border-border hover:border-foreground/20 hover:shadow-md",
 accent:"bg-foreground text-background",
 },
};

const basePricingPlans = PLANS.map((p) => ({
 ...p,
 ...planStyles[p.name],
}));

const DiscountPricing = () => {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [isAnnual, setIsAnnual] = useState(false);
 
 // Get discount from URL, default to 0 if missing/invalid
 const discountParam = parseInt(searchParams.get('amount') || '0', 10);
 const discountAmount = isNaN(discountParam) ? 0 : discountParam;

 const calculateDiscount = (basePrice: number) => {
 if (basePrice === 0 || discountAmount === 0) return basePrice;
 const discount = basePrice * (discountAmount / 100);
 return Math.floor(basePrice - discount);
 };

 return (
 <div className="min-h-screen bg-[#FAF7F5] py-20 px-4 md:px-8">
 <div className="max-w-7xl mx-auto">
 
 <div className="text-center max-w-3xl mx-auto mb-16">
 <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-none p-1 pr-4 bg-white/60 backdrop-blur-sm shadow-sm mb-6">
 <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-none shadow-inner flex items-center gap-1">
 <Sparkles className="w-4 h-4" /> Secret Unlocked
 </div>
 <span className="text-[13px] font-semibold text-gray-800 tracking-wide">
 Your {discountAmount}% OFF discount has been applied!
 </span>
 </div>
 
 <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1A1A1A] mb-6">
 Claim Your Discount
 </h1>
 <p className="text-xl text-gray-600 font-medium">
 Choose your plan below. The {discountAmount}% discount is locked in for the lifetime of your subscription.
 </p>

 <div className="mt-10 flex justify-center items-center gap-4">
 <span className={cn("text-sm font-semibold transition-colors", !isAnnual ?"text-foreground" :"text-muted-foreground")}>Monthly billing</span>
 <div 
 className="w-14 h-7 bg-foreground/10 rounded-none p-1 cursor-pointer relative transition-colors hover:bg-foreground/20"
 onClick={() => setIsAnnual(!isAnnual)}
 >
 <div className={cn(
"w-5 h-5 bg-foreground rounded-none shadow-md transition-transform duration-300",
 isAnnual ?"translate-x-7 bg-primary" :"translate-x-0"
 )} />
 </div>
 <span className={cn("text-sm font-semibold transition-colors flex items-center gap-2", isAnnual ?"text-foreground" :"text-muted-foreground")}>
 Annual billing <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-none">Save 20%</span>
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
 {basePricingPlans.map((plan, idx) => {
 const baseCost = isAnnual ? plan.price.annual : plan.price.monthly;
 const discountedCost = calculateDiscount(baseCost);
 const period = isAnnual ?"/year" :"/month";

 return (
 <Card key={idx} className={cn("relative transition-all duration-300 rounded-none bg-white h-full flex flex-col", plan.color)}>
 {plan.badge && (
 <div className="absolute -top-4 left-0 right-0 flex justify-center">
 <span className={cn("text-xs font-bold tracking-wider px-3 py-1 rounded-none shadow-sm", plan.accent)}>
 {plan.badge}
 </span>
 </div>
 )}
 <CardContent className="p-8 flex-1 flex flex-col">
 <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
 <p className="text-muted-foreground text-sm mb-6 h-10">{plan.description}</p>
 
 <div className="mb-8">
 {discountAmount > 0 && (
 <div className="text-muted-foreground line-through text-lg mb-1 decoration-red-500/50">
 ${baseCost}{period}
 </div>
 )}
 <div className="flex items-baseline gap-1">
 <span className="text-5xl font-bold tracking-tight">${discountedCost}</span>
 <span className="text-muted-foreground font-medium">{period}</span>
 </div>
 {discountAmount > 0 && (
 <div className="text-primary text-sm font-bold mt-2">
 You save ${baseCost - discountedCost}{period}!
 </div>
 )}
 </div>

 <Button 
 onClick={() => {
 // Stash the discount so startCheckout picks it up at checkout
 if (discountAmount > 0) setPendingDiscount(discountAmount);
 navigate('/signup');
 }}
 variant={plan.popular ? "marketing" : "marketingOutline"}
 className="w-full h-12 font-bold mb-8 hover:scale-[1.02]"
 >
 Select {plan.name} <ArrowRight className="w-4 h-4 ml-2" />
 </Button>

 <ul className="space-y-4">
 {plan.features.map((feature, i) => (
 <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
 <Check className="w-5 h-5 text-primary shrink-0" />
 <span>{feature}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )
 })}
 </div>

 </div>
 </div>
 );
};

export default DiscountPricing;
