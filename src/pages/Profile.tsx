import { useState, useEffect, useRef } from"react";
import { useNavigate } from"react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Badge } from"@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";
import { 
 Edit, 
 Save, 
 Camera, 
 Calendar, 
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
} from"lucide-react";
import { cn } from"@/lib/utils";
import { useToast } from"@/hooks/use-toast";
import { Skeleton } from"@/components/ui/skeleton";
import { useAuth } from"@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from"@/lib/postStorage";

const Profile = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);
 const [profile, setProfile] = useState<{
 name: string;
 username: string;
 joinedDate: string;
 plan: string;
 avatarUrl?: string;
 }>({
 name:"",
 username:"",
 joinedDate:"",
 plan:"Free",
 avatarUrl:""
 });
 const [editProfile, setEditProfile] = useState(profile);
 const { toast } = useToast();

 useEffect(() => {
 const fetchProfile = async () => {
 setLoading(true);
 const p = await getUserProfile();
 if (p) {
 const loaded = {
 name: p.name,
 username: p.username,
 joinedDate: p.joinedDate,
 plan: p.plan,
 avatarUrl: p.avatarUrl ||""
 };
 setProfile(loaded);
 setEditProfile(loaded);
 }
 setLoading(false);
 };
 fetchProfile();
 }, [user]);

 const handleSave = async () => {
 const updated = await updateUserProfile({
 name: editProfile.name,
 username: editProfile.username
 });
 if (updated) {
 const data = {
 name: updated.name,
 username: updated.username,
 joinedDate: updated.joinedDate,
 plan: updated.plan,
 avatarUrl: updated.avatarUrl ||""
 };
 setProfile(data);
 setEditProfile(data);
 setIsEditing(false);
 toast({
 title:"Profile Updated",
 description:"Your profile has been saved successfully!"
 });
 } else {
 toast({
 variant:"warning",
 title:"Update Failed",
 description:"Could not update profile. Please try again."
 });
 }
 };

 const handleCancel = () => {
 setEditProfile(profile);
 setIsEditing(false);
 };

 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleAvatarClick = () => {
 fileInputRef.current?.click();
 };

 const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (!file.type.startsWith("image/")) {
 toast({
 title:"Unsupported File",
 description:"Please select an image file (PNG, JPG, etc.).",
 variant:"warning",
 });
 return;
 }

 if (file.size > 2 * 1024 * 1024) {
 toast({
 title:"File Too Large",
 description:"Please select an image under 2MB.",
 variant:"warning",
 });
 return;
 }

 const reader = new FileReader();
 reader.onload = async () => {
 const dataUrl = reader.result as string;
 try {
 const updated = await updateUserProfile({ avatarUrl: dataUrl });
 if (updated) {
 const data = {
 name: updated.name,
 username: updated.username,
 joinedDate: updated.joinedDate,
 plan: updated.plan,
 avatarUrl: updated.avatarUrl ||""
 };
 setProfile(data);
 setEditProfile(data);
 toast({
 title:"Avatar Updated",
 description:"Your profile picture has been successfully updated!",
 });
 } else {
 throw new Error("Update failed");
 }
 } catch (err: any) {
 toast({
 title:"Update Failed",
 description:"Failed to update profile picture.",
 variant:"warning",
 });
 }
 };
 reader.readAsDataURL(file);
 };

 const stats = [
 { label:"Tweets", value:"1,234", icon: MessageSquare, color:"blue" },
 { label:"Following", value:"567", icon: Users, color:"green" },
 { label:"Followers", value:"2,890", icon: TrendingUp, color:"purple" },
 { label:"Likes", value:"8,901", icon: Heart, color:"red" }
 ];

 const recentTweets = [
 { 
 id: 1, 
 content:"Just launched my new project! 🚀 Excited to share what I've been building with the community. ShipOS is going to change how we think about Twitter automation.", 
 likes: 145, 
 retweets: 32, 
 replies: 18,
 time:"2h",
 impressions:"2.1K"
 },
 { 
 id: 2, 
 content:"AI is revolutionizing how we create content. The tools available today would have been science fiction just a few years ago. What's your favorite AI tool for content creation?", 
 likes: 289, 
 retweets: 67, 
 replies: 42,
 time:"1d",
 impressions:"4.3K"
 },
 { 
 id: 3, 
 content:"Beautiful sunset today! 🌅 Sometimes you need to step away from the screen and appreciate the simple things in life. Work-life balance is crucial for long-term success.", 
 likes: 156, 
 retweets: 24, 
 replies: 8,
 time:"2d",
 impressions:"1.8K"
 }
 ];

 const achievements = [
 { name:"Early Adopter", description:"Joined during beta", icon:"🎯" },
 { name:"Content Creator", description:"100+ tweets posted", icon:"✍️" },
 { name:"Engagement Master", description:"High engagement rate", icon:"🔥" },
 { name:"Community Builder", description:"Active in discussions", icon:"🤝" }
 ];

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-3xl font-bold tracking-tighter text-foreground mb-2">
 Account Profile
 </h1>
 <p className="text-sm font-bold text-muted-foreground tracking-[0.2em] flex items-center gap-3">
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
 {loading ? (
 <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6 animate-pulse">
 <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full md:w-auto">
 <Skeleton className="w-24 h-24 rounded-none bg-muted/50 border-4 border-background shadow-sm" />
 <div className="space-y-3 w-full md:w-48 text-center md:text-left mt-2">
 <div className="flex flex-col md:flex-row items-center gap-3">
 <Skeleton className="h-7 w-32 bg-muted/45 rounded-none mx-auto md:mx-0" />
 <Skeleton className="h-5 w-20 bg-muted/30 rounded-none mx-auto md:mx-0" />
 </div>
 <Skeleton className="h-4 w-24 bg-muted/30 rounded-none mx-auto md:mx-0" />
 <Skeleton className="h-4 w-28 bg-muted/20 rounded-none mx-auto md:mx-0" />
 </div>
 </div>
 <Skeleton className="h-10 w-full md:w-28 bg-muted/40 rounded-none" />
 </div>
 ) : (
 <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
 <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
 <div className="relative">
 <Avatar className="w-24 h-24 bg-primary border-4 border-background shadow-sm rounded-none">
 <AvatarImage src={profile.avatarUrl} alt={profile.name} className="rounded-none object-cover" />
 <AvatarFallback className="text-primary-foreground text-2xl font-bold rounded-none">
 {profile.name.split(' ').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <input 
 type="file" 
 ref={fileInputRef} 
 onChange={handleAvatarChange} 
 accept="image/*" 
 className="hidden" 
 />
 <Button 
 onClick={handleAvatarClick}
 size="sm" 
 variant="outline" 
 className="absolute -bottom-1 -right-1 h-8 w-8 rounded-none p-0 bg-background border-border shadow-sm hover:bg-muted"
 >
 <Camera className="w-3.5 h-3.5 text-foreground" />
 </Button>
 </div>
 <div className="space-y-2 text-center md:text-left">
 <div className="flex flex-col md:flex-row items-center gap-3">
 <h1 className="text-2xl font-bold text-foreground tracking-tight">{profile.name}</h1>
 <Badge 
 onClick={() => navigate("/settings?tab=plans")}
 className={cn(
"text-[9px] font-bold tracking-widest px-2 py-1 rounded-none shadow-none flex items-center cursor-pointer transition-all duration-200",
 profile.plan ==="Free" 
 ?"bg-muted text-muted-foreground border border-border hover:bg-muted/80"
 :"bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
 )}
 >
 <Crown className="w-3.5 h-3.5 mr-1.5" />
 {profile.plan ==="Free" ?"No Active Plan" : `${profile.plan} Plan`}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground font-medium">{profile.username}</p>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-xs font-medium">
 <div className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5" />
 <span>Joined {profile.joinedDate}</span>
 </div>
 </div>
 </div>
 </div>
 <Button 
 onClick={() => setIsEditing(!isEditing)}
 variant={isEditing ?"destructive" :"outline"}
 className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold tracking-widest border-border shadow-none"
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
 )}

 {isEditing && (
 <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
 <div className="grid md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label htmlFor="name" className="text-[10px] font-bold tracking-widest text-muted-foreground">Full Name</Label>
 <Input
 id="name"
 value={editProfile.name}
 onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
 className="h-11 rounded-none border-border bg-card shadow-none"
 placeholder="Enter your full name"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="username" className="text-[10px] font-bold tracking-widest text-muted-foreground">Username</Label>
 <Input
 id="username"
 value={editProfile.username}
 onChange={(e) => setEditProfile({...editProfile, username: e.target.value})}
 className="h-11 rounded-none border-border bg-card shadow-none"
 placeholder="@username"
 />
 </div>
 </div>
 <div className="flex gap-3 pt-4">
 <Button onClick={handleSave} className="h-11 rounded-none bg-primary text-primary-foreground font-bold tracking-widest text-[10px] px-6 shadow-none">
 <Save className="w-4 h-4 mr-2" />
 Save Changes
 </Button>
 <Button variant="outline" onClick={handleCancel} className="h-11 rounded-none border-border font-bold tracking-widest text-[10px] px-6 shadow-none">
 Cancel
 </Button>
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
 <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
 <div className="text-[9px] font-bold text-muted-foreground tracking-widest mt-0.5">{stat.label}</div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Activity Tabs */}
 <Tabs defaultValue="tweets" className="space-y-6">
 <TabsList className="bg-muted/50 p-1 rounded-none border border-border h-11 w-full grid grid-cols-3">
 <TabsTrigger value="tweets" className="rounded-none font-bold text-[10px] tracking-widest gap-2">
 <MessageSquare className="w-3.5 h-3.5" />
 Tweets
 </TabsTrigger>
 <TabsTrigger value="analytics" className="rounded-none font-bold text-[10px] tracking-widest gap-2">
 <BarChart3 className="w-3.5 h-3.5" />
 Growth
 </TabsTrigger>
 <TabsTrigger value="activity" className="rounded-none font-bold text-[10px] tracking-widest gap-2">
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
 <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground tracking-widest">
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
 <span className="text-[10px] font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
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
 <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground mb-2">Total Impressions</h4>
 <p className="text-2xl font-bold text-foreground">124.5K</p>
 <p className="text-[10px] text-primary font-bold mt-1">+15.3% growth</p>
 </div>
 <div className="p-5 bg-muted/30 rounded-none border border-border/50">
 <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground mb-2">Engagement Rate</h4>
 <p className="text-2xl font-bold text-foreground">4.2%</p>
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
 <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-0.5">2 hours ago</p>
 </div>
 </div>
 <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-none border border-border/50 transition-colors hover:bg-muted/50">
 <div className="w-8 h-8 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
 <Heart className="w-4 h-4 text-primary" />
 </div>
 <div>
 <p className="text-xs font-bold text-foreground">Your tweet reached 100+ likes</p>
 <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-0.5">1 day ago</p>
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
 <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-0.5">{achievement.description}</p>
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
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground">This Week</span>
 <span className="text-xs font-bold text-foreground">23 tweets</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-border/50">
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground">Engagement</span>
 <span className="text-xs font-bold text-primary">4.2%</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-border/50">
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground">Best Post</span>
 <span className="text-xs font-bold text-foreground">145 likes</span>
 </div>
 <div className="flex justify-between items-center py-2">
 <span className="text-[10px] font-bold tracking-widest text-muted-foreground">Profile Views</span>
 <span className="text-xs font-bold text-foreground">1.2K</span>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
};

export default Profile;
