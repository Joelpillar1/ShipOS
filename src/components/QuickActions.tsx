import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mic, Calendar, Settings, Zap, Send, Layout, MessageSquare } from "lucide-react";
import { TweetModal } from "./TweetModal";
import { VoiceTweetModal } from "./VoiceTweetModal";
import { useToast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const { toast } = useToast();

  const handleAction = (title: string) => {
    toast({
      title: "Action Triggered",
      description: `${title} is being prepared...`
    });
  };

  const actions = [
    { title: "New Post", icon: Plus, color: "bg-primary", textColor: "text-primary-foreground", modal: TweetModal },
    { title: "Voice Note", icon: Mic, color: "bg-muted", textColor: "text-foreground", modal: VoiceTweetModal },
    { title: "Plan Thread", icon: Layout, color: "bg-muted", textColor: "text-foreground" },
    { title: "Auto-Rules", icon: Settings, color: "bg-muted", textColor: "text-foreground" },
  ];

  return (
    <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
      <CardHeader className="border-b border-border bg-card pb-5 px-7">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {actions.map((action, i) => {
            const ButtonContent = (
              <Button 
                onClick={action.modal ? undefined : () => handleAction(action.title)}
                className={`h-28 flex flex-col items-center justify-center ${action.color} ${action.textColor} border-0 transition-all duration-200 rounded-none hover:opacity-90 shadow-none gap-3`}
              >
                <div className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{action.title}</span>
              </Button>
            );

            if (action.modal) {
              const Modal = action.modal;
              return <Modal key={i} trigger={ButtonContent} />;
            }

            return <div key={i}>{ButtonContent}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
};
