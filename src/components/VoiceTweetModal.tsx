import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Send, Image, Video, Edit, RotateCcw, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceTweetModalProps {
  trigger: React.ReactNode;
}

export const VoiceTweetModal = ({ trigger }: VoiceTweetModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecording(true);
      setTranscription("I'm sharing a quick update about our new dashboard rollout. The minimalist design is looking incredible and we're seeing great early feedback from the beta testers. Stay tuned!");
      setIsEditing(true);
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    setTranscription("I'm sharing a quick update about our new dashboard rollout. The minimalist design is looking incredible and we're seeing great early feedback from the beta testers. Stay tuned!");
    setIsEditing(true);
  };

  const postVoiceTweet = () => {
    if (!transcription.trim()) {
      toast({
        title: "Error",
        description: "Please add some content to your voice post",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Voice post published successfully!"
    });
    setHasRecording(false);
    setTranscription("");
    setIsEditing(false);
    setIsOpen(false);
  };

  const resetModal = () => {
    setHasRecording(false);
    setTranscription("");
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetModal();
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border shadow-none p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Voice Post</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                Record and transcribe your message
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {!hasRecording ? (
            <div className="space-y-6 text-center py-10">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <div className={cn(
                  "absolute inset-0 bg-primary/10 rounded-none transition-transform duration-1000",
                  isRecording ? "scale-110 animate-pulse" : "scale-100"
                )} />
                <div className={cn(
                  "w-32 h-32 rounded-none flex items-center justify-center transition-all shadow-none border border-border",
                  isRecording ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                )}>
                  <Mic className={cn("w-12 h-12", isRecording ? "animate-bounce" : "")} />
                </div>
              </div>
              
              {isRecording && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-primary font-bold uppercase tracking-widest text-[10px]">Recording...</p>
                  <div className="flex gap-1 h-4 items-center">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="w-1 bg-primary rounded-none animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-xs rounded-none shadow-none">
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="h-12 px-8 font-bold uppercase tracking-widest text-xs rounded-none shadow-none">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5" />
                    Transcription
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 px-3 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary/5 rounded-none"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                </div>
                
                {isEditing ? (
                  <Textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Refine your message..."
                    className="min-h-[160px] resize-none bg-background border-border focus:ring-primary focus:border-primary text-base leading-relaxed p-5 rounded-none shadow-none"
                  />
                ) : (
                  <div className="p-6 bg-muted/30 border border-border/50 rounded-none min-h-[160px]">
                    <p className="text-foreground leading-relaxed italic">"{transcription}"</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button onClick={resetModal} variant="outline" className="flex-1 h-12 border-border bg-background hover:bg-muted font-bold uppercase tracking-[0.15em] text-xs rounded-none shadow-none">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                <Button onClick={postVoiceTweet} className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-[0.15em] text-xs rounded-none shadow-none">
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
