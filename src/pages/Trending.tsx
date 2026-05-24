import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp,
  Search,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  ExternalLink,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Repeat,
  Eye,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Zap,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Trending = () => {
  const [activeTab, setActiveTab] = useState("x");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const platforms = [
    { id: "x", name: "X", icon: Twitter },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin },
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "facebook", name: "Facebook", icon: Facebook },
  ];

  const trendsByPlatform = {
    x: [
      { 
        id: 1, 
        username: "@techinsider", 
        name: "Tech Insider",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
        text: "Breaking: New AI model achieves human-level performance in problem-solving tasks. This could revolutionize healthcare. #AI #Future",
        timeAgo: "2h",
        stats: { likes: "2.4K", retweets: "891", reach: "1.2M" },
        verified: true,
        category: "Tech"
      },
      { 
        id: 2, 
        username: "@marketwatch", 
        name: "Market Watch",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60",
        text: "5 key trends reshaping digital marketing in 2024. Content creators are seeing 3x engagement with video-first strategies. 🧵",
        timeAgo: "4h",
        stats: { likes: "1.8K", retweets: "634", reach: "892K" },
        verified: true,
        category: "Marketing"
      }
    ],
    linkedin: [
      { 
        id: 1, 
        username: "sarah-design", 
        name: "Sarah Chen",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=60",
        text: "Why minimalist UI is winning in 2024. It's not just about aesthetics, it's about cognitive load and user efficiency.",
        timeAgo: "1h",
        stats: { likes: "3.2K", retweets: "456", reach: "2.1M" },
        verified: true,
        category: "Design"
      }
    ],
    instagram: [
      { 
        id: 1, 
        username: "creative_daily", 
        name: "Creative Daily",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
        text: "Warm minimalism is the new dark mode. Here's how to use organic shapes and earthy tones in your next project. 🎨",
        timeAgo: "6h",
        stats: { likes: "12K", retweets: "1.2K", reach: "4.5M" },
        verified: false,
        category: "Lifestyle"
      }
    ],
    facebook: [
      { 
        id: 1, 
        username: "startup_hub", 
        name: "Startup Hub",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=60",
        text: "The local business boom: How AI tools are helping small businesses compete with giants in 2024.",
        timeAgo: "8h",
        stats: { likes: "854", retweets: "92", reach: "150K" },
        verified: true,
        category: "Local"
      }
    ]
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Market Intelligence</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Viral Opportunities</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="rounded-none border-border h-10 px-4 hover:bg-muted shadow-none"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Refresh Feed</span>
          </Button>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs defaultValue="x" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <TabsList className="bg-muted/50 p-1 rounded-none border border-border h-11">
            {platforms.map((platform) => (
              <TabsTrigger 
                key={platform.id} 
                value={platform.id}
                className="rounded-none px-6 h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none font-bold text-[10px] uppercase tracking-widest gap-2"
              >
                <platform.icon className="w-3 h-3" />
                {platform.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search viral trends..." 
              className="pl-12 h-11 rounded-none bg-card border-border shadow-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {platforms.map((platform) => (
          <TabsContent key={platform.id} value={platform.id} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendsByPlatform[platform.id as keyof typeof trendsByPlatform].map((post) => (
                <Card key={post.id} className="group border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col">
                  <CardHeader className="p-3 flex flex-row items-center gap-2 space-y-0 border-b border-border/30">
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarFallback>{post.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-foreground truncate">{post.name}</p>
                        {post.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{post.username}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{post.timeAgo}</span>
                    </div>
                  </CardHeader>

                  <div className="relative aspect-video overflow-hidden border-b border-border/30">
                    <img 
                      src={post.image} 
                      alt="Trend thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-background/80 backdrop-blur-md text-foreground border-border text-[9px] font-black uppercase tracking-widest px-2 py-1">
                        #{post.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3 flex-1">
                    <p className="text-xs font-medium text-foreground leading-relaxed line-clamp-3 mb-6">
                      {post.text}
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center justify-center p-2 rounded-none bg-muted/40 border border-border/50 group-hover:bg-muted transition-colors duration-300">
                        <Heart className="w-3.5 h-3.5 text-primary mb-1" />
                        <span className="text-[10px] font-black text-foreground">{post.stats.likes}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Likes</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-none bg-muted/40 border border-border/50 group-hover:bg-muted transition-colors duration-300">
                        <Repeat className="w-3.5 h-3.5 text-primary mb-1" />
                        <span className="text-[10px] font-black text-foreground">{post.stats.retweets}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Shares</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-none bg-muted/40 border border-border/50 group-hover:bg-muted transition-colors duration-300">
                        <Eye className="w-3.5 h-3.5 text-primary mb-1" />
                        <span className="text-[10px] font-black text-foreground">{post.stats.reach}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Reach</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 pt-0 flex gap-2 mt-auto">
                    <Button variant="outline" className="flex-1 text-[9px] font-bold uppercase tracking-widest h-9 rounded-none border-border hover:bg-muted shadow-none">
                      View Source
                    </Button>
                    <Button className="flex-1 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[9px] h-9 rounded-none shadow-none group/btn">
                      <Sparkles className="w-3 h-3 mr-2" />
                      Revamp
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-muted/20 rounded-none border border-border">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-background rounded-none flex items-center justify-center border border-border shadow-sm">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Real-time Pulse</p>
            <p className="text-[9px] text-muted-foreground">Tracking viral surges every 60s</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-background rounded-none flex items-center justify-center border border-border shadow-sm">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Audience Match</p>
            <p className="text-[9px] text-muted-foreground">Aligned to your demographics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-background rounded-none flex items-center justify-center border border-border shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Brand Safety</p>
            <p className="text-[9px] text-muted-foreground">Ensuring guideline compliance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;