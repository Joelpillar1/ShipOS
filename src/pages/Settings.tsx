import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Save, 
  User,
  CreditCard,
  Settings as SettingsIcon,
  Mail,
  Crown,
  ChevronRight,
  ShieldCheck,
  Globe,
  Download,
  Trash2,
  Link2,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      mentions: true,
      directMessages: true,
      followers: false,
      weeklyDigest: true,
      securityAlerts: true
    },
    account: {
      email: "joel.pillar@example.com",
      plan: "Free"
    }
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully!"
    });
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Plan",
      description: "Redirecting to billing page...",
    });
  };

  const navigationItems = [
    { id: "account", label: "Account", icon: User, description: "Profile and account details" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Manage notifications" },
    { id: "integrations", label: "Integrations", icon: Link2, description: "Connected accounts" },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription and billing" },
  ];

  const renderAccountSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              Account Details
            </CardTitle>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none">
              {settings.account.plan} Plan
            </Badge>
          </div>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Manage your basic account information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={settings.account.email}
                className="pl-12 h-11 bg-muted/30 border-border rounded-none shadow-none text-sm font-medium"
                placeholder="your@email.com"
                readOnly
              />
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-none border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Current Plan: {settings.account.plan}</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Free tier active</p>
              </div>
            </div>
            <Button onClick={handleUpgradePlan} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-destructive/20 bg-destructive/[0.02] shadow-none rounded-none overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-bold text-destructive flex items-center gap-3">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Delete Account</h4>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Permanently remove your account and all associated data</p>
            </div>
            <Button variant="destructive" className="w-full md:w-auto h-10 rounded-none text-[10px] font-bold uppercase tracking-widest px-6 shadow-none">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Configure how you receive platform updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-6">
        <div className="space-y-6">
          {[
            { id: "email", label: "Email Notifications", desc: "Receive updates via email", checked: settings.notifications.emailNotifications },
            { id: "push", label: "Push Notifications", desc: "Receive browser notifications", checked: settings.notifications.pushNotifications },
            { id: "sms", label: "SMS Notifications", desc: "Receive critical alerts via text", checked: settings.notifications.smsNotifications }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between group py-2 border-b border-border/30 last:border-0">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
              </div>
              <Switch id={item.id} checked={item.checked} className="data-[state=checked]:bg-primary scale-90" />
            </div>
          ))}
        </div>
        <div className="pt-6 mt-4 border-t border-border/50">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <p className="text-[9px] font-bold uppercase tracking-widest">Preferences are synchronized across your devices</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "notifications":
        return renderNotificationsSection();
      case "account":
      default:
        return renderAccountSection();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2">
          Preferences
        </h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
          <SettingsIcon className="w-4 h-4 text-primary" />
          Manage your workspace and account settings
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <nav className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2 opacity-50">Settings Category</p>
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-none transition-all duration-300 text-left border border-transparent group",
                      isActive 
                        ? "bg-muted text-foreground font-bold shadow-none" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-none flex items-center justify-center transition-all duration-300 flex-shrink-0",
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-background"
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {item.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">{item.description}</p>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-10">
            {renderContent()}
            
            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-border/50">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-none font-bold uppercase tracking-widest text-[10px] shadow-none flex items-center gap-3">
                <Save className="w-3.5 h-3.5" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;