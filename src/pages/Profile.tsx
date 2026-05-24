import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Save, 
  Camera, 
  MapPin, 
  Calendar, 
  Link, 
  Twitter, 
  Users, 
  TrendingUp, 
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Settings,
  ShieldCheck,
  BarChart3,
  Clock,
  Sparkles,
  X,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Joel Pillar",
    username: "@joelpillar",
    bio: "Content creator and social media enthusiast. Building amazing things with AI. Helping creators grow their Twitter presence with ShipOS.",
    location: "San Francisco, CA",
    website: "https://joelpillar.com",
    joinedDate: "March 2020",
    plan: "Free"
  });
  const [editProfile, setEditProfile] = useState(profile);
  const { toast } = useToast();

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully!"
    });
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    { label: "Tweets", value: "1,234", icon: MessageSquare, color: "blue" },
    { label: "Following", value: "567", icon: Users, color: "green" },
    { label: "Followers", value: "2,890", icon: TrendingUp, color: "purple" },
    { label: "Likes", value: "8,901", icon: Heart, color: "red" }
  ];

  const recentTweets = [
    { 
      id: 1, 
      content: "Just launched my new project! 🚀 Excited to share what I've been building with the community. ShipOS is going to change how we think about Twitter automation.", 
      likes: 145, 
      retweets: 32, 
      replies: 18,
      time: "2h",
      impressions: "2.1K"
    },
    { 
      id: 2, 
      content: "AI is revolutionizing how we create content. The tools available today would have been science fiction just a few years ago. What's your favorite AI tool for content creation?", 
      likes: 289, 
      retweets: 67, 
      replies: 42,
      time: "1d",
      impressions: "4.3K"
    },
    { 
      id: 3, 
      content: "Beautiful sunset today! 🌅 Sometimes you need to step away from the screen and appreciate the simple things in life. Work-life balance is crucial for long-term success.", 
      likes: 156, 
      retweets: 24, 
      replies: 8,
      time: "2d",
      impressions: "1.8K"
    }
  ];

  const achievements = [
    { name: "Early Adopter", description: "Joined during beta", icon: "🎯" },
    { name: "Content Creator", description: "100+ tweets posted", icon: "✍️" },
    { name: "Engagement Master", description: "High engagement rate", icon: "🔥" },
    { name: "Community Builder", description: "Active in discussions", icon: "🤝" }
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2">
          Account Profile
        </h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary" />
          Manage your presence across all connected socials
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24 bg-primary border-4 border-background shadow-sm">
                      <AvatarImage src="" alt={profile.name} />
                      <AvatarFallback className="text-primary-foreground text-2xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-none p-0 bg-background border-border shadow-sm hover:bg-muted">
                      <Camera className="w-3.5 h-3.5 text-foreground" />
                    </Button>
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <h1 className="text-2xl font-bold text-foreground tracking-tight">{profile.name}</h1>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none shadow-none flex items-center">
                        <Crown className="w-3 h-3 mr-1.5" />
                        {profile.plan} Plan
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{profile.username}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Joined {profile.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "outline"}
                  className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold uppercase tracking-widest border-border shadow-none"
                >
                  {isEditing ? (
                    <>
                      <X className="w-3.5 h-3.5 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-3.5 h-3.5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input
                        id="name"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                        className="h-11 rounded-none border-border bg-card shadow-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                      <Input
                        id="username"
                        value={editProfile.username}
                        onChange={(e) => setEditProfile({...editProfile, username: e.target.value})}
                        className="h-11 rounded-none border-border bg-card shadow-none"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                      className="resize-none rounded-none border-border bg-card shadow-none min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                      <Input
                        id="location"
                        value={editProfile.location}
                        onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                        className="h-11 rounded-none border-border bg-card shadow-none"
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Website</Label>
                      <Input
                        id="website"
                        value={editProfile.website}
                        onChange={(e) => setEditProfile({...editProfile, website: e.target.value})}
                        className="h-11 rounded-none border-border bg-card shadow-none"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="h-11 rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] px-6 shadow-none">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="h-11 rounded-none border-border font-bold uppercase tracking-widest text-[10px] px-6 shadow-none">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{profile.bio}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-3.5 h-3.5 text-primary" />
                    <a 
                      href={profile.website} 
                      className="text-primary hover:underline font-bold text-sm" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/50">
                {stats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className="text-center p-4 rounded-none bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
                      <div className="w-9 h-9 bg-primary/5 rounded-none flex items-center justify-center mx-auto mb-3 border border-primary/10">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xl font-black text-foreground tracking-tight">{stat.value}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Tabs defaultValue="tweets" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-none border border-border h-11 w-full grid grid-cols-3">
              <TabsTrigger value="tweets" className="rounded-none font-bold text-[10px] uppercase tracking-widest gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Tweets
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-none font-bold text-[10px] uppercase tracking-widest gap-2">
                <BarChart3 className="w-3.5 h-3.5" />
                Growth
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none font-bold text-[10px] uppercase tracking-widest gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tweets" className="space-y-4">
              {recentTweets.map((tweet) => (
                <Card key={tweet.id} className="border border-border bg-card shadow-none rounded-none hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-foreground leading-relaxed mb-4">{tweet.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{tweet.replies}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{tweet.retweets}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{tweet.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>{tweet.impressions}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {tweet.time}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card className="border border-border bg-card shadow-none rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg font-bold tracking-tight">Performance Overview</CardTitle>
                  <CardDescription className="text-xs font-medium">Your activity over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-muted/30 rounded-none border border-border/50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Impressions</h4>
                      <p className="text-2xl font-black text-foreground">124.5K</p>
                      <p className="text-[10px] text-primary font-bold mt-1">+15.3% growth</p>
                    </div>
                    <div className="p-5 bg-muted/30 rounded-none border border-border/50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Engagement Rate</h4>
                      <p className="text-2xl font-black text-foreground">4.2%</p>
                      <p className="text-[10px] text-primary font-bold mt-1">+0.8% optimal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card className="border border-border bg-card shadow-none rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg font-bold tracking-tight">Recent Activity</CardTitle>
                  <CardDescription className="text-xs font-medium">Latest interactions and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-none border border-border/50 transition-colors hover:bg-muted/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Gained 15 new followers</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-none border border-border/50 transition-colors hover:bg-muted/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Your tweet reached 100+ likes</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card className="border border-border bg-card shadow-none rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <Sparkles className="w-4 h-4 text-primary" />
                Achievements
              </CardTitle>
              <CardDescription className="text-xs font-medium">Your milestones and badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-none border border-border/50 transition-all hover:bg-muted/50">
                  <span className="text-xl">{achievement.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{achievement.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border border-border bg-card shadow-none rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <BarChart3 className="w-4 h-4 text-primary" />
                Quick Stats
              </CardTitle>
              <CardDescription className="text-xs font-medium">Efficiency & performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">This Week</span>
                <span className="text-xs font-black text-foreground">23 tweets</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Engagement</span>
                <span className="text-xs font-black text-primary">4.2%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Best Post</span>
                <span className="text-xs font-black text-foreground">145 likes</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile Views</span>
                <span className="text-xs font-black text-foreground">1.2K</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
