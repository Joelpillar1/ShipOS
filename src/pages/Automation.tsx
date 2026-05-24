import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Zap, MessageSquare, Heart, Repeat, Settings, Play, Pause, Send, Users, Clock, TrendingUp, Bot } from "lucide-react";
import { AutomationRuleModal } from "@/components/AutomationRuleModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Automation = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState([
    { id: 1, name: "Auto-reply to mentions", type: "reply", status: "active", triggers: 45, successRate: 92 },
    { id: 2, name: "Like tweets with keywords", type: "like", status: "active", triggers: 128, successRate: 87 },
    { id: 3, name: "Follow back new followers", type: "follow", status: "paused", triggers: 23, successRate: 95 },
    { id: 4, name: "Auto-retweet industry news", type: "retweet", status: "active", triggers: 67, successRate: 89 },
    { id: 5, name: "Welcome DM to new followers", type: "dm", status: "active", triggers: 34, successRate: 78 },
  ]);

  const [editingRule, setEditingRule] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    keywords: "",
    message: "",
    limit: "",
    delay: "",
    accounts: ""
  });

  const toggleRule = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { ...rule, status: rule.status === "active" ? "paused" : "active" }
        : rule
    ));
    
    const rule = rules.find(r => r.id === id);
    toast({
      title: `Rule ${rule?.status === "active" ? "Paused" : "Activated"}`,
      description: `${rule?.name} has been ${rule?.status === "active" ? "paused" : "activated"}`
    });
  };

  const handleCreateAutoReply = () => {
    const keywords = (document.getElementById('reply-trigger') as HTMLInputElement)?.value;
    const message = (document.getElementById('reply-message') as HTMLInputElement)?.value;
    
    if (!keywords || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRule = {
      id: Date.now(),
      name: `Auto-reply: ${keywords}`,
      type: "reply",
      status: "active",
      triggers: 0,
      successRate: 0
    };

    setRules([...rules, newRule]);
    toast({
      title: "Auto-Reply Created",
      description: "Your auto-reply rule is now active"
    });

    // Clear form
    (document.getElementById('reply-trigger') as HTMLInputElement).value = '';
    (document.getElementById('reply-message') as HTMLInputElement).value = '';
  };

  const handleCreateAutoLike = () => {
    const keywords = (document.getElementById('like-keywords') as HTMLInputElement)?.value;
    const limit = (document.getElementById('like-limit') as HTMLInputElement)?.value;
    
    if (!keywords || !limit) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRule = {
      id: Date.now(),
      name: `Auto-like: ${keywords}`,
      type: "like",
      status: "active",
      triggers: 0,
      successRate: 0
    };

    setRules([...rules, newRule]);
    toast({
      title: "Auto-Like Created",
      description: "Your auto-like rule is now active"
    });

    // Clear form
    (document.getElementById('like-keywords') as HTMLInputElement).value = '';
    (document.getElementById('like-limit') as HTMLInputElement).value = '';
  };

  const handleCreateFollowBack = () => {
    const criteria = (document.getElementById('follow-criteria') as HTMLInputElement)?.value;
    const delay = (document.getElementById('follow-delay') as HTMLInputElement)?.value;
    
    if (!criteria || !delay) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRule = {
      id: Date.now(),
      name: `Follow-back: ${criteria}`,
      type: "follow",
      status: "active",
      triggers: 0,
      successRate: 0
    };

    setRules([...rules, newRule]);
    toast({
      title: "Follow-Back Created",
      description: "Your follow-back rule is now active"
    });

    // Clear form
    (document.getElementById('follow-criteria') as HTMLInputElement).value = '';
    (document.getElementById('follow-delay') as HTMLInputElement).value = '';
  };

  const handleCreateAutoRetweet = () => {
    const keywords = (document.getElementById('retweet-keywords') as HTMLInputElement)?.value;
    const accounts = (document.getElementById('retweet-accounts') as HTMLInputElement)?.value;
    
    if (!keywords) {
      toast({
        title: "Error",
        description: "Please fill in keywords",
        variant: "destructive"
      });
      return;
    }

    const newRule = {
      id: Date.now(),
      name: `Auto-retweet: ${keywords}`,
      type: "retweet",
      status: "active",
      triggers: 0,
      successRate: 0
    };

    setRules([...rules, newRule]);
    toast({
      title: "Auto-Retweet Created",
      description: "Your auto-retweet rule is now active"
    });

    // Clear form
    (document.getElementById('retweet-keywords') as HTMLInputElement).value = '';
    (document.getElementById('retweet-accounts') as HTMLInputElement).value = '';
  };

  const handleCreateAutoDM = () => {
    const message = (document.getElementById('dm-message') as HTMLInputElement)?.value;
    const delay = (document.getElementById('dm-delay') as HTMLInputElement)?.value;
    
    if (!message || !delay) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRule = {
      id: Date.now(),
      name: `Welcome DM`,
      type: "dm",
      status: "active",
      triggers: 0,
      successRate: 0
    };

    setRules([...rules, newRule]);
    toast({
      title: "Auto-DM Created",
      description: "Your auto-DM rule is now active"
    });

    // Clear form
    (document.getElementById('dm-message') as HTMLInputElement).value = '';
    (document.getElementById('dm-delay') as HTMLInputElement).value = '';
  };

  const handleAddNewRule = () => {
    toast({
      title: "New Rule",
      description: "Opening rule creation wizard..."
    });
  };

  const handleEditRule = (ruleId: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule(rule);
      setEditFormData({
        name: rule.name,
        keywords: "",
        message: "",
        limit: "",
        delay: "",
        accounts: ""
      });
    }
  };

  const updateRule = () => {
    if (!editingRule || !editFormData.name) {
      toast({
        title: "Error",
        description: "Please fill in the rule name",
        variant: "destructive"
      });
      return;
    }

    const updatedRules = rules.map(rule => 
      rule.id === editingRule.id 
        ? { ...rule, name: editFormData.name }
        : rule
    );
    
    setRules(updatedRules);
    setEditingRule(null);
    setEditFormData({
      name: "",
      keywords: "",
      message: "",
      limit: "",
      delay: "",
      accounts: ""
    });
    
    toast({
      title: "Rule Updated",
      description: "Your automation rule has been updated successfully"
    });
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setEditFormData({
      name: "",
      keywords: "",
      message: "",
      limit: "",
      delay: "",
      accounts: ""
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "reply": return MessageSquare;
      case "like": return Heart;
      case "follow": return Users;
      case "retweet": return Repeat;
      case "dm": return Send;
      default: return Bot;
    }
  };

  const automationStats = [
    { label: "Total Automations", value: "297", change: "+34 this week", trend: "up" },
    { label: "Success Rate", value: "89.2%", change: "+2.3% this week", trend: "up" },
    { label: "Time Saved", value: "6.4h", change: "daily average", trend: "neutral" },
    { label: "Active Rules", value: "4", change: "1 paused", trend: "neutral" },
  ];

  return (
    <div className="min-h-screen bg-background pt-10">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
                Automation Studio
              </h1>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                <Bot className="w-4 h-4 text-primary" />
                Smart workflows for multi-platform growth
              </p>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 border border-border rounded-none px-5 py-2.5">
              <div className="w-2 h-2 bg-primary rounded-none animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Systems Operational</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Active Rules</TabsTrigger>
            <TabsTrigger value="create">Create Rule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Automation Rules</h2>
              <p className="text-gray-600">Manage your active automation rules</p>
            </div>

            <div className="grid gap-4">
              {rules.map((rule) => {
                const IconComponent = getIconForType(rule.type);
                return (
                  <Card key={rule.id} className="border border-border bg-card shadow-none rounded-none overflow-hidden hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-7">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-muted rounded-none border border-border">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-1">{rule.name}</h3>
                            <div className="flex items-center gap-4">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{rule.triggers} triggers / mo</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{rule.successRate}% success</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge 
                            variant={rule.status === "active" ? "default" : "secondary"}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-none shadow-none",
                              rule.status === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {rule.status}
                          </Badge>
                          <Switch
                            checked={rule.status === "active"}
                            onCheckedChange={() => toggleRule(rule.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditRule(rule.id)}
                            className="h-9 w-9 rounded-none hover:bg-muted"
                          >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Create Automation Rule</CardTitle>
                <CardDescription>Set up a new automation to engage with your audience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Auto-Reply
                      </CardTitle>
                      <CardDescription>Automatically reply to mentions and DMs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reply-trigger">Trigger Keywords</Label>
                          <Input id="reply-trigger" placeholder="hello, hi, support" />
                        </div>
                        <div>
                          <Label htmlFor="reply-message">Reply Message</Label>
                          <Input id="reply-message" placeholder="Thanks for reaching out!" />
                        </div>
                        <Button className="w-full" onClick={handleCreateAutoReply}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Create Auto-Reply Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        Auto-Like
                      </CardTitle>
                      <CardDescription>Like tweets containing specific keywords</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="like-keywords">Keywords to Like</Label>
                          <Input id="like-keywords" placeholder="startup, entrepreneur, SaaS" />
                        </div>
                        <div>
                          <Label htmlFor="like-limit">Daily Limit</Label>
                          <Input id="like-limit" type="number" placeholder="50" />
                        </div>
                        <Button className="w-full" onClick={handleCreateAutoLike}>
                          <Heart className="w-4 h-4 mr-2" />
                          Create Auto-Like Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-green-600" />
                        Auto-Retweet
                      </CardTitle>
                      <CardDescription>Automatically retweet content with specific keywords</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="retweet-keywords">Keywords to Retweet</Label>
                          <Input id="retweet-keywords" placeholder="industry news, tech updates" />
                        </div>
                        <div>
                          <Label htmlFor="retweet-accounts">Trusted Accounts (optional)</Label>
                          <Input id="retweet-accounts" placeholder="@techcrunch, @venturebeat" />
                        </div>
                        <Button className="w-full" onClick={handleCreateAutoRetweet}>
                          <Repeat className="w-4 h-4 mr-2" />
                          Create Auto-Retweet Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="w-5 h-5 text-purple-600" />
                        Auto-DM
                      </CardTitle>
                      <CardDescription>Send welcome messages to new followers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dm-message">Welcome Message</Label>
                          <Input id="dm-message" placeholder="Thanks for following! Feel free to reach out anytime." />
                        </div>
                        <div>
                          <Label htmlFor="dm-delay">Delay (hours)</Label>
                          <Input id="dm-delay" type="number" placeholder="2" />
                        </div>
                        <Button className="w-full" onClick={handleCreateAutoDM}>
                          <Send className="w-4 h-4 mr-2" />
                          Create Auto-DM Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      Follow-Back
                    </CardTitle>
                    <CardDescription>Automatically follow back users who follow you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="follow-criteria">Follow Criteria</Label>
                        <Input id="follow-criteria" placeholder="Min followers: 100" />
                      </div>
                      <div>
                        <Label htmlFor="follow-delay">Delay (hours)</Label>
                        <Input id="follow-delay" type="number" placeholder="2" />
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCreateFollowBack}>
                      <Users className="w-4 h-4 mr-2" />
                      Create Follow-Back Rule
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {automationStats.map((stat, index) => (
                <Card key={index} className="border border-border bg-card shadow-none rounded-none overflow-hidden">
                  <CardHeader className="pb-3 p-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-2">
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="flex items-center gap-2">
                      {stat.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        stat.trend === "up" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>See how your automation rules are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.map((rule) => {
                    const IconComponent = getIconForType(rule.type);
                    return (
                      <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-none bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-none border border-gray-200">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rule.name}</p>
                            <p className="text-sm text-gray-500">{rule.triggers} actions this month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-green-600">{rule.successRate}% success</span>
                            <Badge variant="outline" className="text-xs">
                              {rule.status === "active" ? "Running" : "Paused"}
                            </Badge>
                          </div>
                          <Progress value={rule.successRate} className="w-24 h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Engagement Impact</CardTitle>
                  <CardDescription>How automation affects your engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Auto-Replies</span>
                      <span className="text-sm text-green-600">+24% response rate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Auto-Likes</span>
                      <span className="text-sm text-green-600">+18% engagement</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Follow-Backs</span>
                      <span className="text-sm text-green-600">+12% follower retention</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Auto-Retweets</span>
                      <span className="text-sm text-green-600">+31% reach</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Time Savings</CardTitle>
                  <CardDescription>Time saved through automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#FF6154] mb-2">6.4h</div>
                      <p className="text-sm text-gray-600">saved daily on average</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">2.1h</div>
                        <p className="text-xs text-gray-500">engagement</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">1.8h</div>
                        <p className="text-xs text-gray-500">content curation</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">1.3h</div>
                        <p className="text-xs text-gray-500">replies</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">1.2h</div>
                        <p className="text-xs text-gray-500">follow management</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Rule Modal */}
        <Dialog open={!!editingRule} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Automation Rule</DialogTitle>
              <DialogDescription>
                Update your automation rule settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-rule-name">Rule Name</Label>
                <Input
                  id="edit-rule-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              
              {editingRule?.type === "reply" && (
                <>
                  <div>
                    <Label htmlFor="edit-keywords">Trigger Keywords</Label>
                    <Input
                      id="edit-keywords"
                      value={editFormData.keywords}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="hello, hi, support"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-message">Reply Message</Label>
                    <Input
                      id="edit-message"
                      value={editFormData.message}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Thanks for reaching out!"
                    />
                  </div>
                </>
              )}
              
              {editingRule?.type === "like" && (
                <>
                  <div>
                    <Label htmlFor="edit-like-keywords">Keywords to Like</Label>
                    <Input
                      id="edit-like-keywords"
                      value={editFormData.keywords}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="startup, entrepreneur, SaaS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-like-limit">Daily Limit</Label>
                    <Input
                      id="edit-like-limit"
                      type="number"
                      value={editFormData.limit}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, limit: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                </>
              )}
              
              {editingRule?.type === "follow" && (
                <>
                  <div>
                    <Label htmlFor="edit-follow-criteria">Follow Criteria</Label>
                    <Input
                      id="edit-follow-criteria"
                      value={editFormData.keywords}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="Min followers: 100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-follow-delay">Delay (hours)</Label>
                    <Input
                      id="edit-follow-delay"
                      type="number"
                      value={editFormData.delay}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, delay: e.target.value }))}
                      placeholder="2"
                    />
                  </div>
                </>
              )}
              
              {editingRule?.type === "retweet" && (
                <>
                  <div>
                    <Label htmlFor="edit-retweet-keywords">Keywords to Retweet</Label>
                    <Input
                      id="edit-retweet-keywords"
                      value={editFormData.keywords}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="industry news, tech updates"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-retweet-accounts">Trusted Accounts (optional)</Label>
                    <Input
                      id="edit-retweet-accounts"
                      value={editFormData.accounts}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, accounts: e.target.value }))}
                      placeholder="@techcrunch, @venturebeat"
                    />
                  </div>
                </>
              )}
              
              {editingRule?.type === "dm" && (
                <>
                  <div>
                    <Label htmlFor="edit-dm-message">Welcome Message</Label>
                    <Input
                      id="edit-dm-message"
                      value={editFormData.message}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Thanks for following! Feel free to reach out anytime."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-dm-delay">Delay (hours)</Label>
                    <Input
                      id="edit-dm-delay"
                      type="number"
                      value={editFormData.delay}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, delay: e.target.value }))}
                      placeholder="2"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button onClick={updateRule} className="flex-1">
                  Update Rule
                </Button>
                <Button variant="outline" onClick={cancelEdit} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Automation;
