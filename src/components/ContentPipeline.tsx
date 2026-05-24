import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectedAccounts } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const ContentPipeline = () => {
  const getMockPlatform = (index: number) => {
    if (connectedAccounts.length === 0) return null;
    return connectedAccounts[index % connectedAccounts.length];
  };

  const scheduledPosts = [
    { content: "5 productivity tips that changed my life as a creator...", time: "2:00 PM Today", status: "scheduled", account: getMockPlatform(0) },
    { content: "The biggest mistake I see new users make (and how to avoid it)", time: "6:00 PM Today", status: "scheduled", account: getMockPlatform(1) },
    { content: "Thread: How I grew from 100 to 10k followers in 6 months", time: "Tomorrow 10:00 AM", status: "scheduled", account: getMockPlatform(2) },
  ];

  const drafts = [
    { content: "AI is changing the game for content creators...", status: "draft" },
    { content: "3 tools every solopreneur needs in 2024", status: "draft" },
  ];

  return (
    <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
      <CardHeader className="border-b border-border bg-card pb-5 px-7 flex flex-row items-center justify-between">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Content Pipeline
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-muted">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="p-7 space-y-10">
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Scheduled Queue
          </h3>
          <div className="space-y-4">
            {scheduledPosts.map((post, index) => (
              <div key={index} className="flex items-start gap-4 p-5 bg-muted/40 border border-border/50 rounded-none hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="w-1.5 h-1.5 rounded-none bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{post.time}</span>
                    <span className="text-foreground/20 text-xs">•</span>
                    {post.account && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <post.account.icon className={cn("w-3 h-3", post.account.color)} />
                        {post.account.platform}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 rounded-none transition-opacity">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
            Drafts
          </h3>
          <div className="space-y-4">
            {drafts.map((draft, index) => (
              <div key={index} className="flex items-start gap-4 p-5 bg-background border border-border rounded-none hover:border-muted-foreground/30 transition-all cursor-pointer group">
                <div className="w-1.5 h-1.5 rounded-none bg-muted-foreground/30 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">{draft.content}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-3">Unscheduled Draft</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 rounded-none transition-opacity">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="p-5 bg-muted/20 border-t border-border">
        <Button variant="ghost" className="w-full text-[11px] font-bold uppercase tracking-widest h-10 rounded-none text-primary hover:bg-primary/5 transition-all">
          View All Content
        </Button>
      </div>
    </Card>
  );
};
