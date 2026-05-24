import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Zap, Users, BarChart3, Star, ArrowRight, Sparkles, Clock, Layout, ShieldCheck, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      name: "Free",
      id: "FREE",
      price: { monthly: 0, annual: 0 },
      description: "Entry-level access for emerging pilots",
      features: [
        "1 Social Channel",
        "5 AI Engines/mo",
        "Basic Metrics",
        "Core Automations",
      ],
      current: true,
    },
    {
      name: "Growth",
      id: "ASCEND",
      price: { monthly: 19, annual: 190 },
      description: "Accelerated power for serious creators",
      features: [
        "3 Social Channels",
        "200 AI Engines/mo",
        "Advanced Analytics",
        "Full Pipeline Control",
        "Priority Command",
      ],
      popular: true,
    },
    {
      name: "Pro",
      id: "ELITE",
      price: { monthly: 49, annual: 490 },
      description: "Maximum authority for elite teams",
      features: [
        "Unlimited Channels",
        "Unlimited AI Content",
        "Real-time Intelligence",
        "Multi-User Command",
        "API Integration",
      ],
    }
  ];

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Protocol Updated",
      description: `Access level changed to ${planName}.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-background border-border shadow-none p-0 overflow-hidden rounded-none animate-in zoom-in-95 duration-300">
        <div className="bg-primary/5 p-12 border-b border-border text-center relative overflow-hidden">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-4xl font-black text-foreground tracking-tighter mb-4 uppercase">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em] max-w-xl mx-auto">
            Scale your social presence with powerful AI tools and automation.
          </DialogDescription>
          
          <div className="flex items-center justify-center gap-8 mt-12">
            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isAnnual ? "text-primary" : "text-muted-foreground")}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary rounded-none"
            />
            <div className="flex items-center gap-4">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isAnnual ? "text-primary" : "text-muted-foreground")}>Annual</span>
              <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none shadow-sm">Save 20%</Badge>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={cn(
                  "relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300",
                  plan.popular ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-none">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{plan.name}</p>
                    {plan.current && <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-border text-primary rounded-none">Current</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-foreground tracking-tighter">${isAnnual ? plan.price.annual : plan.price.monthly}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isAnnual ? '/year' : '/month'}</span>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-6 space-y-8">
                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.current}
                    className={cn(
                      "w-full h-12 font-bold uppercase tracking-widest text-[10px] rounded-none shadow-none transition-all",
                      plan.current 
                        ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" 
                        : plan.popular 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-background text-foreground border border-border hover:bg-muted"
                    )}
                  >
                    {plan.current ? "Active Plan" : "Upgrade Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 text-center py-6 border-t border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.15em]">Secure Payment • Cancel Anytime • 7-Day Refund Policy</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;