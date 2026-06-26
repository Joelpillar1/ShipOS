import React, { useState, useEffect } from"react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Switch } from"@/components/ui/switch";
import { Badge } from"@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SectionBadge = ({ label, text, mobileText }: { label: string; text: string; mobileText?: string }) => (
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
 toast({
 title:"You already have an active subscription",
 description:"Manage or change your plan from Settings → Billing.",
 });
 }
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
   <div className="max-w-7xl mx-auto px-6 pricing-header-padding pb-20">
     <div className="text-center mb-16">
       <SectionBadge label="Pricing" text="Simple pricing for all your needs" />
       
       <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 mt-2">
         Schedule & Grow on Every Platform
       </h2>
       <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
         All plans include a 7-day free trial. No credit card charges during trial. Cancel anytime.
       </p>

       {/* Social Platform Icons — squares at the top */}
       <div className="flex items-center gap-2 flex-wrap justify-center mb-10">
         {/* X / Twitter */}
         <div title="X (Twitter)" className="w-9 h-9 rounded-none bg-black dark:bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.733-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
         </div>
         {/* LinkedIn */}
         <div title="LinkedIn" className="w-9 h-9 rounded-none bg-[#0A66C2] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
         </div>
         {/* Threads */}
         <div title="Threads" className="w-9 h-9 rounded-none bg-black dark:bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 192 192" className="w-4 h-4 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M141.537 88.9883C140.55 88.5919 139.55 88.2104 138.548 87.8427C136.811 61.9671 122.385 47.4197 100.023 47.2913C99.8809 47.2905 99.7389 47.2898 99.5971 47.2898C86.7284 47.2898 75.9028 52.9648 69.3013 62.8905L80.3698 70.0551C85.3591 62.3848 93.4649 60.5918 99.6069 60.5918C99.7133 60.5918 99.82 60.5921 99.9266 60.5928C107.976 60.6465 113.987 63.0413 117.777 67.7066C120.45 71.0178 122.179 75.5523 122.952 81.2436C116.757 80.2285 110.062 79.9099 102.93 80.2965C81.1609 81.5175 67.1847 94.0917 68.0947 112.286C68.5538 121.478 73.0527 129.317 80.7524 134.389C87.2745 138.717 95.7413 140.837 104.545 140.346C116.151 139.699 125.203 135.291 131.474 127.234C136.242 121.122 139.2 112.991 140.366 102.675C145.437 105.77 149.183 110.088 151.19 115.335C154.681 124.553 154.895 139.566 143.241 151.181C132.891 161.48 120.531 166.066 101.542 166.199C80.4998 166.065 64.3199 159.299 53.5167 146.014C43.4264 133.567 38.2187 115.575 38.0001 93C38.2187 70.4253 43.4264 52.4338 53.5167 39.9868C64.3199 26.7016 80.4998 19.9349 101.542 19.8011C122.732 19.936 139.315 26.7316 150.441 40.1011C155.957 46.7144 160.117 55.2012 162.856 65.4089L175.297 62.0898C172.014 49.9619 166.811 39.3789 159.681 30.5671C145.671 13.4121 125.648 4.61505 101.619 4.4801H101.536C77.5577 4.61505 57.9049 13.4404 44.2009 30.6471C31.9527 46.2079 25.6367 68.0989 25.4007 94.9889L25.4 96L25.4007 97.0111C25.6367 123.901 31.9527 145.792 44.2009 161.353C57.9049 178.56 77.5577 187.385 101.536 187.52H101.619C122.873 187.395 137.8 181.529 149.342 170.025C164.745 154.663 164.276 135.497 159.029 122.422C155.253 112.856 147.827 105.02 138.003 99.9996C137.273 96.3094 136.294 92.8965 135.075 89.7884C133.921 86.8558 132.784 84.3994 131.698 82.3764C131.643 82.2736 131.588 82.1715 131.534 82.0704L141.537 88.9883Z"/></svg>
         </div>
         {/* Bluesky */}
         <div title="Bluesky" className="w-9 h-9 rounded-none bg-[#0085FF] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 600 530" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M135.72 44.03C202.216 93.951 273.74 195.17 300 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.018-2.936-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.449-163.25-81.433C20.155 217.613 10 86.535 10 68.825c0-88.687 77.742-60.816 125.72-24.795z"/></svg>
         </div>
         {/* Pinterest */}
         <div title="Pinterest" className="w-9 h-9 rounded-none bg-[#E60023] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.365 11.99-11.987C24.006 5.367 18.641 0 12.017 0z"/></svg>
         </div>
         {/* Instagram */}
         <div title="Instagram" className="w-9 h-9 rounded-none flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm" style={{background:'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'}}>
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
         </div>
         {/* Facebook */}
         <div title="Facebook" className="w-9 h-9 rounded-none bg-[#1877F2] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
         </div>
         {/* YouTube */}
         <div title="YouTube" className="w-9 h-9 rounded-none bg-[#FF0000] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93 .502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
         </div>
         {/* TikTok */}
         <div title="TikTok" className="w-9 h-9 rounded-none bg-black flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
           <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
         </div>
       </div>

       {/* Billing Switcher Toggle */}
       <div className="flex items-center justify-center gap-4 bg-muted/80 border border-border rounded-none p-1 w-fit mx-auto shadow-sm">
         <span className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer", !isAnnual ?"bg-background text-foreground shadow-sm" :"text-muted-foreground")} onClick={() => setIsAnnual(false)}>
           Monthly
         </span>
         <Switch
           checked={isAnnual}
           onCheckedChange={setIsAnnual}
           className="data-[state=checked]:bg-primary"
         />
         <span className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer flex items-center", isAnnual ?"bg-background text-foreground shadow-sm" :"text-muted-foreground")} onClick={() => setIsAnnual(true)}>
           Annual Billing
           <Badge className="bg-primary/15 text-primary border-transparent rounded-none text-[8.5px] font-bold py-0.5 px-2 ml-2 shadow-none">
             Save 20%
           </Badge>
         </span>
       </div>

    </div>

    {/* Plans */}
    <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
      {PLANS.map((plan) => {
        const price = isAnnual ? plan.price.annual : plan.price.monthly;
        const isBusy = busyPlan === plan.name;

        return (
          <Card
            key={plan.name}
            className={cn(
              "relative border-2 border-black rounded-none flex flex-col justify-between h-full transition-all duration-300",
              plan.popular 
                ? "shadow-[8px_8px_0px_0px_rgba(215,90,52,1)] bg-[#fbf4f2] dark:bg-[#1a1310]" 
                : "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#11100e]"
            )}
          >
            {plan.badge && (
              <div className={cn(
                "absolute top-4 right-4 text-[8px] font-bold tracking-wider px-2.5 py-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black animate-pulse z-10",
                plan.popular ? "bg-[#d75a34] text-white" : "bg-foreground text-background"
              )}>
                {plan.badge}
              </div>
            )}

            <CardContent className="p-8 flex-1 flex flex-col justify-between text-left bg-background/30">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-none mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
                </div>

                <div className="border-t border-b border-border/60 py-4 flex items-baseline">
                  {isAnnual ? (
                    <div className="flex items-baseline space-x-2 flex-wrap">
                      <span className="text-4xl font-extrabold text-foreground font-mono">${plan.price.annual}</span>
                      <span className="text-xs font-semibold text-muted-foreground mr-2">/year</span>
                      <span className="text-sm font-medium text-muted-foreground/60 line-through font-mono">
                        ${plan.price.monthly * 12}
                      </span>
                      <span className="text-[10px] font-bold text-[#d75a34] bg-[#d75a34]/10 border border-black dark:border-white px-1.5 py-0.5 rounded-none ml-1">
                        Save 20%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-foreground font-mono">${plan.price.monthly}</span>
                      <span className="text-xs font-semibold text-muted-foreground">/month</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground block">Includes Features:</span>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm font-semibold text-foreground/90">
                      <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSelect(plan.name)}
                disabled={isBusy}
                variant={plan.popular ? "default" : "outline"}
                className="w-full h-12 text-base font-extrabold mt-8 flex items-center justify-center gap-2"
              >
                {isBusy ? "Please wait…" : <>Try it for $0 (7-days) <ArrowRight className="w-4 h-4" /></>}
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
      <p className="text-xs text-muted-foreground font-medium">
        Switching from another tool? Compare ShipOS to{" "}
        <a href="/compare/buffer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">Buffer</a>
        {" "}or{" "}
        <a href="/compare/hootsuite" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">Hootsuite →</a>
      </p>

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