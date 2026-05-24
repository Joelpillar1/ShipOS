import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ExternalLink,
  Type,
  Image as ImageIcon,
  Video,
  Clock,
  Heart,
  Repeat,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentFilter } from "@/components/ContentFilter";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  FacebookIcon 
} from "@/components/PlatformIcons";

const Posted = () => {
  const { toast } = useToast();
  const posts = [
    {
      id: 1,
      type: "image",
      content: "Just dropped a deep dive into the modern social stack. Minimalist, AI-first, and built for speed. #SaaS #AI",
      accounts: [
        { handle: "@johndoe", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "johndoe", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
      ],
      postedAt: "2h ago",
      stats: { likes: "1.2K", shares: "420", reach: "45K" },
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      type: "text",
      content: "Consistency isn't about intensity; it's about architecture. Build systems that work while you sleep.",
      accounts: [
        { handle: "@acme_official", platform: "instagram", icon: InstagramIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "AcmePage", platform: "facebook", icon: FacebookIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      postedAt: "5h ago",
      stats: { likes: "850", shares: "120", reach: "22K" },
      image: null
    },
    {
      id: 3,
      type: "image",
      content: "The best content feels like a conversation, not a broadcast. Engage, don't just post. #Marketing",
      accounts: [
        { handle: "acme-corp", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      postedAt: "1d ago",
      stats: { likes: "2.4K", shares: "890", reach: "110K" },
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      type: "video",
      content: "Why we're moving away from generic engagement pods and towards high-signal communities.",
      accounts: [
        { handle: "@acmecorp", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      postedAt: "2d ago",
      stats: { likes: "3.1K", shares: "1.1K", reach: "250K" },
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'image': return <ImageIcon className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Analytics / History</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Published</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Report button removed */}
        </div>
      </div>

      <ContentFilter />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="group border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-foreground/20 transition-all duration-300 flex flex-col">
            
            {/* Card Header: Type & Actions */}
            <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center">
                  {getTypeIcon(post.type)}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
                  {post.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => toast({ title: "Opening Analytics", description: "Fetching real-time performance data..." })}
                  className="flex items-center gap-1 px-2 py-1 bg-muted border border-border text-[8px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                >
                  Insights
                </button>
              </div>
            </div>

            {/* Media Area (Dynamic Height) */}
            <div className="relative h-14 group-hover:h-44 transition-all duration-500 ease-in-out bg-muted overflow-hidden border-b border-border">
              {post.image ? (
                <img 
                  src={post.image} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Type className="w-4 h-4 text-muted-foreground/20" />
                </div>
              )}
              {/* Overlaid Time Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {post.postedAt}
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <p className="text-[11px] font-medium text-foreground leading-relaxed line-clamp-2">
                  {post.content}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-1 mb-4 py-3 border-y border-border/50">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[10px] font-black text-foreground">
                    <Heart className="w-2.5 h-2.5 text-muted-foreground" />
                    {post.stats.likes}
                  </div>
                  <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Likes</span>
                </div>
                <div className="flex flex-col items-center border-x border-border/50">
                  <div className="flex items-center gap-1 text-[10px] font-black text-foreground">
                    <Repeat className="w-2.5 h-2.5 text-muted-foreground" />
                    {post.stats.shares}
                  </div>
                  <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Shares</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[10px] font-black text-foreground">
                    <Eye className="w-2.5 h-2.5 text-muted-foreground" />
                    {post.stats.reach}
                  </div>
                  <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Reach</span>
                </div>
              </div>

              {/* Destination Accounts */}
              <div className="mt-auto">
                <div className="flex flex-wrap gap-1">
                  {post.accounts.map((acc, i) => {
                    const Icon = acc.icon;
                    return (
                      <div key={i} className="relative w-7 h-7 border border-border overflow-hidden bg-muted shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]" title={acc.handle}>
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.handle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-muted-foreground">{acc.handle.charAt(1).toUpperCase()}</div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                          <Icon className="w-1.5 h-1.5 text-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Posted;
