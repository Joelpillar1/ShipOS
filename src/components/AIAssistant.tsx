import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateGroqIdeas, enhanceGroqContent, getFriendlyAIErrorMessage } from "@/lib/ai";
import { getUserProfile } from "@/lib/postStorage";
import { cn } from "@/lib/utils";

const aiModes = {
  improve: "Improve my post",
  shorten: "Make it shorter",
  expand: "Expand into detail",
  storytelling: "Make it a story",
  controversy: "Add some spice (Hot take)",
  positivity: "Make it more positive",
  professional: "Make it professional",
  casual: "Make it casual"
};

const trendingHashtags = [
  { tag: "web3", posts: 4500 },
  { tag: "AI", posts: 8900 },
  { tag: "NFT", posts: 2300 },
  { tag: "StartupLife", posts: 1200 },
  { tag: "SaaS", posts: 3400 },
  { tag: "ProductHunt", posts: 900 },
  { tag: "NoCode", posts: 1800 },
  { tag: "IndieHackers", posts: 750 },
  { tag: "TechTwitter", posts: 5600 },
  { tag: "100DaysOfCode", posts: 3200 },
];

const postTemplates = [
  {
    title: "The 'How I Did It' Framework (LinkedIn)",
    tweets: [
      "How I achieved [Result] in [Timeframe] without [Common Obstacle].",
      "Most people think you need [X] to get [Y]. But they're wrong.",
      "Here is the exact 3-step system I used:",
      "1. [Action 1]\n2. [Action 2]\n3. [Action 3]",
      "The hardest part was [Challenge]. But once I figured that out, everything clicked.",
      "Stop doing [Common Mistake]. Start doing [Better Approach]."
    ]
  },
  {
    title: "Contrarian Take (X/Twitter)",
    tweets: [
      "[Common Belief] is completely dead.",
      "Here is why 99% of people are wrong about [Topic], and what you should be doing instead. 🧵",
      "Point 1: The math doesn't work. [Explain].",
      "Point 2: The incentives are misaligned. [Explain].",
      "If you want to actually win in 2026, do the opposite of what everyone else is doing.",
      "TLDR: [Summary]"
    ]
  },
  {
    title: "Value Thread Hook",
    tweets: [
      "10 [Resources/Tools] that feel illegal to know about (I use #4 every day):",
      "1. [Tool Name] - [Brief explanation of value].",
      "2. [Tool Name] - [Brief explanation of value].",
      "3. [Tool Name] - [Brief explanation of value]."
    ]
  }
];

interface AIAssistantProps {
  currentContent: string;
  isThreadMode: boolean;
  currentThreadTweets: Array<{ id: number, content: string, media: any[] }>;
  onInsertContent: (content: string) => void;
  onInsertThread: (tweets: string[]) => void;
  onEnhanceContent: (enhanced: string) => void;
  onEnhanceThread: (enhancedTweets: string[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentContent,
  isThreadMode,
  currentThreadTweets,
  onInsertContent,
  onInsertThread,
  onEnhanceContent,
  onEnhanceThread
}) => {
  const { toast } = useToast();
  const [selectedAIMode, setSelectedAIMode] = useState("improve");
  const [activeAITab, setActiveAITab] = useState("suggestions");
  const [aiTopic, setAiTopic] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isAIThreadMode, setIsAIThreadMode] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    const p = await getUserProfile();
    setProfile(p);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const plan = profile?.plan?.toLowerCase() || "free";
  const isFree = plan === "free";
  const isOutOfCredits = !isFree && plan !== "pro" && (profile?.aiCredits !== undefined && profile.aiCredits <= 0);


  const handleGenerateIdeas = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate ideas",
        variant: "destructive"
      });
      return;
    }

    if (isFree) {
      toast({
        title: "Subscription Required",
        description: "AI features require an active subscription. Please select a plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    if (isOutOfCredits) {
      toast({
        title: "Out of Credits",
        description: "You have run out of AI credits. Please upgrade your plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAIGenerating(true);
    
    try {
      if (isAIThreadMode) {
        const posts = await generateGroqIdeas(aiTopic, true) as string[];
        onInsertThread(posts);
        toast({ title: "Success", description: "Generated a new series!" });
      } else {
        const tweet = await generateGroqIdeas(aiTopic, false) as string;
        onInsertContent(tweet);
        toast({ title: "Success", description: "Generated a new post!" });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: getFriendlyAIErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsAIGenerating(false);
      fetchProfile();
    }
  };

  const handleEnhanceContent = async () => {
    if (isThreadMode && currentThreadTweets.every(t => !t.content.trim())) {
      toast({
        title: "Content Required",
        description: "Please write some content before applying AI enhancement",
        variant: "destructive"
      });
      return;
    } else if (!isThreadMode && !currentContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please write some content before applying AI enhancement",
        variant: "destructive"
      });
      return;
    }

    if (isFree) {
      toast({
        title: "Subscription Required",
        description: "AI features require an active subscription. Please select a plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    if (isOutOfCredits) {
      toast({
        title: "Out of Credits",
        description: "You have run out of AI credits. Please upgrade your plan in Settings.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAIGenerating(true);
    const aiModeName = aiModes[selectedAIMode as keyof typeof aiModes];
    
    try {
      if (isThreadMode) {
        const enhancedThreadTweets = await Promise.all(
          currentThreadTweets.map(async (tweet) => {
            if (!tweet.content.trim()) return tweet.content;
            return await enhanceGroqContent(tweet.content, selectedAIMode);
          })
        );
        onEnhanceThread(enhancedThreadTweets);
      } else {
        const enhancedContent = await enhanceGroqContent(currentContent, selectedAIMode);
        onEnhanceContent(enhancedContent);
      }
      
      toast({
        title: "Content Enhanced",
        description: `Successfully applied: ${aiModeName}`
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: getFriendlyAIErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsAIGenerating(false);
      fetchProfile();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card overflow-y-auto">
      <div className="p-4 border-b flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5" />
            AI Co-pilot
          </h2>
          {profile && (
            <span className={cn(
              "text-xs px-2 py-0.5 border-2 border-black font-mono font-bold shadow-[1px_1px_0px_rgba(0,0,0,1)]",
              plan === "free" ? "bg-red-200" : plan === "pro" ? "bg-purple-200" : "bg-yellow-200"
            )}>
              {plan === "free" ? "Plan required" : plan === "pro" ? "Pro (Unlimited)" : `${profile.aiCredits} Credits`}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Get AI-powered content suggestions</p>
      </div>
      
      <div className="p-4 space-y-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-mono">AI Mode:</span>
            <Select 
              value={selectedAIMode} 
              onValueChange={setSelectedAIMode}
            >
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(aiModes).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-mono">Series</span>
            <Switch 
              checked={isAIThreadMode}
              onCheckedChange={setIsAIThreadMode}
              className="scale-75"
            />
          </div>
        </div>
        
        <Tabs defaultValue="suggestions" value={activeAITab} onValueChange={setActiveAITab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="text-xs">Ideas</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            <TabsTrigger value="hashtags" className="text-xs">Hashtags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-3 mt-3">
            <div className="border rounded-none p-3 space-y-3">
              {isFree ? (
                <div className="bg-red-50 border-2 border-red-200 p-2 text-xs text-red-800 font-medium">
                  AI features require an active subscription. Please choose a plan in Settings.
                </div>
              ) : isOutOfCredits ? (
                <div className="bg-orange-50 border-2 border-orange-200 p-2 text-xs text-orange-800 font-medium">
                  You have 0 AI credits left. Please upgrade in Settings.
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Generate a post about..." 
                    className="text-sm rounded-none border-border"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    disabled={isAIGenerating}
                  />
                  <Button 
                    className="text-sm whitespace-nowrap rounded-none border-2 border-transparent bg-foreground text-background hover:bg-transparent hover:text-foreground hover:border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]" 
                    onClick={handleGenerateIdeas}
                    disabled={isAIGenerating || !aiTopic.trim()}
                  >
                    {isAIGenerating ? "Gen..." : "Generate"}
                  </Button>
                </div>
              )}
              <p className="text-[10px] text-gray-500">
                {isAIThreadMode 
                  ? "Generates a complete series based on your topic"
                  : "Creates a single post based on your topic"}
              </p>
            </div>
            
            <div className="border rounded-none p-3 space-y-3">
              {isFree ? (
                <Button 
                  className="w-full text-sm font-bold bg-gray-400 text-white rounded-none cursor-not-allowed border-2 border-transparent"
                  disabled
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Subscribe to use AI
                </Button>
              ) : isOutOfCredits ? (
                <Button 
                  className="w-full text-sm font-bold bg-gray-400 text-white rounded-none cursor-not-allowed border-2 border-transparent"
                  disabled
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  0 Credits left
                </Button>
              ) : (
                <Button 
                  className="w-full text-sm font-bold bg-[#E65100] text-white hover:bg-[#E65100]/90 rounded-none border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  onClick={handleEnhanceContent}
                  disabled={isAIGenerating || (isThreadMode ? currentThreadTweets.every(t => !t.content.trim()) : !currentContent.trim())}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isAIGenerating ? "Enhancing..." : "Enhance with AI"}
                </Button>
              )}
              <p className="text-[10px] text-gray-500">
                Enhances your current editor content using the selected AI mode
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4 mt-4">
            {postTemplates.map((template, idx) => (
              <div key={idx} className="border rounded-none p-3 hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => {
                if (template.tweets.length > 1) {
                  onInsertThread(template.tweets);
                  toast({ title: "Template Applied", description: "Series template has been inserted." });
                } else {
                  onInsertContent(template.tweets[0]);
                  toast({ title: "Template Applied", description: "Post template has been inserted." });
                }
              }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-bold uppercase">{template.title}</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {template.tweets[0]}
                  </p>
                  {template.tweets.length > 1 && (
                    <p className="text-[10px] text-gray-400 font-mono">
                      +{template.tweets.length - 1} more parts
                    </p>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="hashtags" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((tag, idx) => (
                <div 
                  key={idx} 
                  className="px-2 py-1 text-xs border rounded-none cursor-pointer hover:bg-foreground hover:text-background transition-colors"
                  onClick={() => {
                    if (isThreadMode && currentThreadTweets.length > 0) {
                      // Just append to the first tweet for simplicity in this demo
                      const newContent = currentThreadTweets[0].content + " #" + tag.tag;
                      const newTweets = [...currentThreadTweets];
                      newTweets[0] = { ...newTweets[0], content: newContent };
                      onEnhanceThread(newTweets.map(t => t.content));
                    } else {
                      onEnhanceContent(currentContent + " #" + tag.tag);
                    }
                    toast({ title: "Hashtag Added", description: `#${tag.tag} added to your post` });
                  }}
                >
                  <span className="font-bold">#{tag.tag}</span>
                  <span className="ml-1 text-[10px] opacity-70 text-gray-500">
                    {(tag.posts / 1000).toFixed(1)}k
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
