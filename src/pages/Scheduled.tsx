import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Edit,
  Trash2,
  Zap,
  Type,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentFilter } from "@/components/ContentFilter";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  FacebookIcon 
} from "@/components/PlatformIcons";

const Scheduled = () => {
  const { toast } = useToast();
  const posts = [
    {
      id: 1,
      type: "image",
      content: "Building the future of social management. AI-first, user-centric, and minimalist. 🚀 #SaaS #AI",
      accounts: [
        { handle: "@johndoe", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "johndoe", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
      ],
      date: "May 18, 2026",
      time: "10:00 AM",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      type: "text",
      content: "The 3 pillars of effective content strategy in 2024: Authenticity, Velocity, and Intelligence.",
      accounts: [
        { handle: "@acme_official", platform: "instagram", icon: InstagramIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "AcmePage", platform: "facebook", icon: FacebookIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      date: "May 18, 2026",
      time: "02:00 PM",
      image: null
    },
    {
      id: 3,
      type: "image",
      content: "Why minimalism is more than an aesthetic—it's a competitive advantage for your cognitive load.",
      accounts: [
        { handle: "acme-corp", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      date: "May 19, 2026",
      time: "09:00 AM",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      type: "video",
      content: "New case study: How we boosted engagement by 300% using AI-driven viral triggers.",
      accounts: [
        { handle: "@acmecorp", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      date: "May 20, 2026",
      time: "11:30 AM",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 5,
      type: "text",
      content: "Global multi-platform campaign launch. Testing the limits of our distribution engine with 10+ concurrent destinations. 🌍",
      accounts: [
        { handle: "@main_hub", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "company_hq", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "@brand_global", platform: "instagram", icon: InstagramIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "BrandOfficial", platform: "facebook", icon: FacebookIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "@hub_backup", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "hq_eu", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "@brand_eu", platform: "instagram", icon: InstagramIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "BrandEU", platform: "facebook", icon: FacebookIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "@hub_asia", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "hq_asia", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      date: "May 22, 2026",
      time: "08:00 AM",
      image: null
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
            <div className="w-1.5 h-1.5 bg-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Operations / Queue</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Scheduled</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Force Deploy button removed */}
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
                  onClick={() => toast({ title: "Deploying Post", description: "Sending this post to all destination accounts immediately." })}
                  className="flex items-center gap-1 px-2 py-1 bg-foreground text-background text-[8px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-colors"
                >
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  Post Now
                </button>
                <div className="w-px h-3 bg-border mx-0.5" />
                <button className="p-1 hover:bg-muted text-muted-foreground transition-colors">
                  <Edit className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                  <Trash2 className="w-3 h-3" />
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
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {post.time}
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{post.date}</div>
                <p className="text-[11px] font-medium text-foreground leading-relaxed line-clamp-2">
                  {post.content}
                </p>
              </div>

              {/* Destination Accounts */}
              <div className="mt-auto pt-4 border-t border-border/50">
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

export default Scheduled;
