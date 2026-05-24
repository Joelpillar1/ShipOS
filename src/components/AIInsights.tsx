import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Users, Sparkles, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIInsights = () => {
  const insights = [
    {
      icon: TrendingUp,
      title: "Content Performance",
      description: "Visual posts get 3.2x more engagement across all platforms.",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Optimal Timing",
      description: "Posting between 1PM-3PM yields 40% higher reach today.",
      color: "text-foreground"
    },
    {
      icon: Users,
      title: "Audience Preference",
      description: "Your audience is highly responsive to educational threads.",
      color: "text-muted-foreground"
    }
  ];

  return (
    <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
      <CardHeader className="border-b border-border bg-card pb-5 px-7">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-7 space-y-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-muted/40 rounded-none border border-border/50">
              <div className="w-10 h-10 bg-card border border-border rounded-none flex items-center justify-center flex-shrink-0">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm leading-tight">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-5 bg-primary/5 border border-primary/20 rounded-none relative overflow-hidden group cursor-pointer hover:bg-primary/10 transition-all">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">Strategic Tip</h4>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              Threaded content performs 3x better than single posts for you. Try turning your next big idea into a 5-post carousel or thread!
            </p>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors" />
        </div>
      </CardContent>
      <div className="p-5 bg-muted/20 border-t border-border">
        <Button variant="ghost" className="w-full text-[11px] font-bold uppercase tracking-widest h-10 rounded-none text-primary hover:bg-primary/5 transition-all">
          Full Analytics Report
        </Button>
      </div>
    </Card>
  );
};
