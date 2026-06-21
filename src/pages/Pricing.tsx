import React, { useState, useEffect } from"react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Switch } from"@/components/ui/switch";
import { Badge } from"@/components/ui/badge";
import { Check, Crown } from"lucide-react";
import { cn } from"@/lib/utils";
import { useToast } from"@/hooks/use-toast";
import { useNavigate } from"react-router-dom";
import { changePlan, type BillingCycle, type Plan } from"@/lib/billing";
import { useAuth } from"@/hooks/useAuth";
import { PLANS } from"@/lib/plans";
import { getUserProfile } from"@/lib/postStorage";
import { Header } from"@/components/Header";
import { SEO } from"@/components/SEO";
import { pricingSchema, breadcrumbSchema, softwareApplicationSchema } from"@/lib/seo";

const SOCIAL_BADGES = [
 {
 name:"Twitter / X",
 bg:"bg-[#101010]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>),
 },
 {
 name:"Instagram",
 bg:"bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>),
 },
 {
 name:"LinkedIn",
 bg:"bg-[#0077B5]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>),
 },
 {
 name:"Facebook",
 bg:"bg-[#1877F2]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>),
 },
 {
 name:"TikTok",
 bg:"bg-[#010101]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>),
 },
 {
 name:"YouTube",
 bg:"bg-[#FF0000]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>),
 },
 {
 name:"Bluesky",
 bg:"bg-[#0285FF]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/></svg>),
 },
 {
 name:"Threads",
 bg:"bg-[#101010]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>),
 },
 {
 name:"Pinterest",
 bg:"bg-[#BD081C]",
 icon: (<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" /></svg>),
 },
];


export default function Pricing() {
 const [isAnnual, setIsAnnual] = useState(false);
 const [busyPlan, setBusyPlan] = useState<Plan | null>(null);
 const { toast } = useToast();
 const { user, isMockMode } = useAuth();
 const navigate = useNavigate();
 const [profile, setProfile] = useState<any>(null);

 useEffect(() => {
 if (user || isMockMode) {
 getUserProfile().then(setProfile);
 }
 }, [user, isMockMode]);

 async function handleSelect(plan: Plan) {
 if (!isMockMode && !user) {
 navigate("/login", { replace: false, state: { next:"/pricing" } });
 return;
 }
 if (profile && profile.plan !=="Free") {
 toast({
 title:"Existing Subscription",
 description:"Redirecting you to Settings to change your plan securely.",
 });
 navigate("/settings?tab=plans", { state: { activeSection:"plans" } });
 return;
 }
 setBusyPlan(plan);
 try {
 const cycle: BillingCycle = isAnnual ?"annual" :"monthly";
 // changePlan modifies an existing subscription in place (proration, no new trial) and
 // transparently falls back to a new checkout when there's no subscription to modify.
 const res = await changePlan(plan, cycle);
 if (res.mockGranted) {
 toast({
 title:"Plan updated",
 description: `You're now on the ${plan} plan (demo mode).`,
 });
 } else if (res.changed) {
 toast({
 title:"Plan change started",
 description: `Switching you to the ${plan} plan. This updates in a few seconds.`,
 });
 } else if (res.alreadySubscribed) {
 // Server refused to create a duplicate subscription — guide the user to manage
 // their existing one instead of double-billing.
 toast({
 title:"You already have an active subscription",
 description:"Manage or change your plan from Settings → Billing.",
 });
 }
 // Real new-subscription path: changePlan → startCheckout redirects to Dodo checkout.
 } catch (e: any) {
 toast({
 title:"Plan change error",
 description: e?.message ||"Could not change your plan.",
 variant:"destructive",
 });
 } finally {
 setBusyPlan(null);
 }
 }

 return (
 <div className="min-h-screen bg-background">
 <SEO
 title="Pricing — Simple Plans for Creators & Marketers"
 description="ShipOS pricing: Starter $19/mo, Creator $29/mo, and Pro $49/mo. Schedule unlimited posts, AI Content Studio credits, Slideshow Studio, bulk scheduling, analytics, and multiple workspaces. 7-day free trial on every paid plan."
 path="/pricing"
 type="product"
 keywords={["social media scheduler pricing","social media management pricing","ShipOS plans","cheap social media scheduler"]}
 jsonLd={[
 pricingSchema(),
 softwareApplicationSchema(),
 breadcrumbSchema([
 { name:"Home", path:"/" },
 { name:"Pricing", path:"/pricing" },
 ]),
 ]}
 />
 <Header />
 <div className="border-b border-border/70 bg-background">
 <div className="container mx-auto px-4 py-14 text-center relative overflow-hidden">
 <div className="flex justify-center mb-6">
 <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center">
 <Crown className="w-8 h-8 text-primary-foreground" />
 </div>
 </div>
 <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
 Choose Your Plan
 </h1>
 <p className="text-sm text-muted-foreground font-bold tracking-[0.2em] max-w-2xl mx-auto">
 Scale your social presence with powerful AI tools and automation.
 </p>

 {/* Billing Period Toggle */}
 <div className="flex items-center justify-center gap-6 mt-10">
 <span
 className={cn(
"text-[10px] font-bold tracking-widest transition-colors",
 !isAnnual ?"text-primary" :"text-muted-foreground",
 )}
 >
 Monthly
 </span>
 <Switch
 checked={isAnnual}
 onCheckedChange={setIsAnnual}
 className="data-[state=checked]:bg-primary rounded-none"
 />
 <div className="flex items-center gap-3">
 <span
 className={cn(
"text-[10px] font-bold tracking-widest transition-colors",
 isAnnual ?"text-primary" :"text-muted-foreground",
 )}
 >
 Annual
 </span>
 <Badge className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-none shadow-sm">
 Save 20%
 </Badge>
 </div>
 </div>
 </div>
 </div>

 {/* Plans */}
 <div className="container mx-auto px-4 py-12">
 <div className="grid md:grid-cols-3 gap-6 items-stretch">
 {PLANS.map((plan) => {
 const price = isAnnual ? plan.price.annual : plan.price.monthly;
 const periodLabel = isAnnual ?"/year" :"/month";
 const isBusy = busyPlan === plan.name;

 return (
 <Card
 key={plan.name}
 className={cn(
"relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full",
 plan.popular ?"ring-2 ring-primary bg-primary/[0.02]" :"hover:border-primary/30",
 )}
 >
 {plan.badge && (
 <div className="absolute top-0 right-0">
 <div className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest py-1 px-4 rounded-none">
 {plan.badge}
 </div>
 </div>
 )}

 <CardHeader className="p-8 pb-4">
 <div className="flex items-center justify-between mb-4">
 <CardTitle className="text-base font-bold tracking-widest text-muted-foreground">
 {plan.name}
 </CardTitle>
 </div>
 <div className="flex items-baseline gap-1 mb-2">
 <span className="text-4xl font-bold text-foreground tracking-tighter">${price}</span>
 <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
 {periodLabel}
 </span>
 </div>
 <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
 {plan.description}
 </CardDescription>
 </CardHeader>

 <CardContent className="p-8 pt-6 space-y-8 flex-1 flex flex-col justify-between">
 <div className="space-y-3.5">
 <p className="text-[9px] font-bold text-muted-foreground tracking-wider">
 Includes Features:
 </p>
 {plan.features.map((feature, i) => (
 <div key={i} className="flex items-center gap-3">
 <Check className="w-4 h-4 text-primary" />
 <span className="text-sm font-medium text-foreground/90">{feature}</span>
 </div>
 ))}
 </div>

 <Button
 onClick={() => handleSelect(plan.name)}
 disabled={isBusy}
 className={cn(
"w-full h-12 font-bold tracking-widest text-[10px] rounded-none shadow-none transition-all",
 plan.popular
 ?"bg-primary text-primary-foreground hover:bg-primary/90"
 :"bg-background text-foreground border border-border hover:bg-muted",
 )}
 >
 {isBusy ?"Please wait…" :"Start 7-Day Trial"}
 </Button>
 </CardContent>
 </Card>
 );
 })}
 </div>

 <div className="flex flex-col items-center gap-4 text-center py-10 border-t border-border/70 mt-12">
 <div className="flex items-center gap-3 text-muted-foreground">
 <Check className="w-4 h-4" />
 <p className="text-[10px] font-bold tracking-[0.15em]">
 Secure checkout via Dodo Payments • Cancel anytime • 7-day trial
 </p>
 </div>

  {/* Post to: social strip */}
  <div className="flex flex-row items-center justify-center gap-2 pt-4 border-t border-border/40 w-full overflow-hidden">
  <span className="text-sm font-semibold text-muted-foreground mr-1 shrink-0">Post to:</span>
  <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
  {SOCIAL_BADGES.map((badge, idx) => (
  <div
  key={idx}
  className={cn(
 "relative group w-8 h-8 sm:w-9 sm:h-9 rounded-none flex items-center justify-center border border-black/5 shadow-sm shrink-0",
  badge.bg
  )}
  >
  {badge.icon}
  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
  {badge.name}
  </span>
  </div>
  ))}
  </div>
  </div>
 </div>
 </div>
 </div>
 );
}