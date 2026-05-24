import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Video, Mic, Send, Calendar, Sparkles, X, Layout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TweetModalProps {
  trigger: React.ReactNode;
  onSubmit?: (tweet: any) => void;
}

export const TweetModal = ({ trigger, onSubmit }: TweetModalProps) => {
  const [content, setContent] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePostNow = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const post = {
      id: Date.now(),
      content,
      status: "published",
      date: new Date().toISOString()
    };

    onSubmit?.(post);
    toast({
      title: "Success",
      description: "Post published successfully!"
    });
    setContent("");
    setIsOpen(false);
  };

  const handleSchedule = () => {
    if (!content.trim() || !scheduledTime) {
      toast({
        title: "Error",
        description: "Please fill in content and schedule time",
        variant: "destructive"
      });
      return;
    }

    const post = {
      id: Date.now(),
      content,
      scheduledFor: new Date(scheduledTime).toLocaleString(),
      status: "scheduled",
      date: new Date().toISOString()
    };

    onSubmit?.(post);
    toast({
      title: "Success",
      description: "Post scheduled successfully!"
    });
    setContent("");
    setScheduledTime("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border shadow-none p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
              <Layout className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Content Composer</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                Draft across all platforms
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Post Content</Label>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">Improve with AI</span>
              </div>
            </div>
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] resize-none bg-background border-border focus:ring-primary focus:border-primary text-base leading-relaxed p-5 rounded-none shadow-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[
                  { icon: Image, label: "Image" },
                  { icon: Video, label: "Video" },
                  { icon: Mic, label: "Voice" },
                ].map((tool, i) => (
                  <Button key={i} variant="ghost" size="sm" className="h-9 px-3 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground gap-2">
                    <tool.icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{tool.label}</span>
                  </Button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-none">
                {280 - content.length} Characters Left
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="schedule" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Schedule (Optional)</Label>
            <div className="relative">
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-background border-border h-12 rounded-none focus:ring-primary focus:border-primary px-4"
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handlePostNow} className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-[0.15em] text-xs rounded-none shadow-none">
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
            <Button onClick={handleSchedule} variant="outline" className="flex-1 h-12 border-border bg-background hover:bg-muted font-bold uppercase tracking-[0.15em] text-xs rounded-none shadow-none">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
