import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileEdit, 
  Edit,
  Trash2,
  ArrowRight,
  Type,
  Image as ImageIcon,
  Video,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentFilter } from "@/components/ContentFilter";
import { Progress } from "@/components/ui/progress";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  FacebookIcon 
} from "@/components/PlatformIcons";

const Drafts = () => {
  const { toast } = useToast();
  const posts = [
    {
      id: 1,
      type: "image",
      content: "Exploring the intersection of AI and human creativity. A thread on why we still need the 'human in the loop'.",
      accounts: [
        { handle: "@johndoe", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
        { handle: "johndoe", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" }
      ],
      lastEdited: "10m ago",
      progress: 85,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      type: "text",
      content: "3 ways to optimize your social media workflow using ShipOS. #Productivity #SaaS",
      accounts: [
        { handle: "@acme_official", platform: "instagram", icon: InstagramIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" },
        { handle: "AcmePage", platform: "facebook", icon: FacebookIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      lastEdited: "2h ago",
      progress: 40,
      image: null
    },
    {
      id: 3,
      type: "image",
      content: "The minimalist guide to personal branding. Focus on signal, ignore the noise.",
      accounts: [
        { handle: "acme-corp", platform: "linkedin", icon: LinkedInIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      lastEdited: "1d ago",
      progress: 60,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      type: "video",
      content: "Behind the scenes: Our journey to building the most efficient social management hub.",
      accounts: [
        { handle: "@acmecorp", platform: "x", icon: XIcon, avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" }
      ],
      lastEdited: "3d ago",
      progress: 95,
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
            <FileEdit className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Creative / Workspace</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Drafts</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="h-12 rounded-none border-border bg-card font-black uppercase tracking-[0.2em] text-[10px] px-8 shadow-none"
          >
            Archive All
          </Button>
          <Button 
            className="h-12 rounded-none bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-[0.2em] text-[10px] px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            New Draft
          </Button>
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
              {/* Overlaid Edited Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {post.lastEdited}
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <p className="text-[11px] font-medium text-foreground leading-relaxed line-clamp-2">
                  {post.content}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Completion</span>
                  <span className="text-[8px] font-black text-foreground">{post.progress}%</span>
                </div>
                <Progress value={post.progress} className="h-1 rounded-none bg-muted" />
              </div>

              {/* Destination Accounts & Finish Action */}
              <div className="mt-auto flex items-end justify-between">
                <div className="flex flex-wrap gap-1">
                  {post.accounts.map((acc, i) => {
                    const Icon = acc.icon;
                    return (
                      <div key={i} className="relative w-7 h-7 border border-border overflow-hidden bg-muted shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]" title={acc.handle}>
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.handle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-muted-foreground">
                            {acc.handle.startsWith('@') ? acc.handle.charAt(1).toUpperCase() : acc.handle.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                          <Icon className="w-1.5 h-1.5 text-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button size="sm" variant="ghost" className="h-7 rounded-none text-foreground font-black uppercase tracking-widest text-[9px] group/btn px-2 hover:bg-foreground hover:text-background">
                  Finish
                  <ArrowRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Drafts;
