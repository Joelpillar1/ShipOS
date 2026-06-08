import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, Book, Mail, Phone, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const Help = () => {
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get("tab");
  const [activeTab, setActiveTab] = useState("faq");

  useEffect(() => {
    const allowed = ["faq", "contact", "feedback"];
    if (queryTab && allowed.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    type: "improvement",
    rating: 5,
    message: ""
  });

  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours!"
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feedback Submitted",
      description: "Thank you for helping us improve ShipOS!"
    });
    setFeedbackForm({ type: "improvement", rating: 5, message: "" });
  };

  const faqs = [
    {
      question: "How do I connect my social media accounts?",
      answer: "Go to the Connect Accounts page from the sidebar. Select the platform you want to connect (like X, LinkedIn, Instagram, TikTok, etc.) and authorize ShipOS to manage your posts."
    },
    {
      question: "How do I create a new post?",
      answer: "You can create a new post by clicking the 'Create Post' button in the sidebar or by using the post composer in the Content Studio. You can customize the content for each connected platform before publishing."
    },
    {
      question: "How do I schedule posts?",
      answer: "In the post composer, select a date and time using the Schedule option, or click 'Queue' to let the app automatically assign the next available slot in your posting queue. Your post will be automatically published at the specified time."
    },
    {
      question: "Can I edit my drafts?",
      answer: "Yes! Go to the Drafts page from the sidebar where you can view, edit, or delete all your saved drafts."
    },
    {
      question: "How do I view my analytics?",
      answer: "Visit the Analytics page from the sidebar to see detailed insights about your post performance, engagement metrics (likes, comments, shares, views), and follower growth statistics across your connected platforms."
    },
    {
      question: "What file formats are supported for media uploads?",
      answer: "We support standard image formats (JPG, PNG, WEBP, GIF) and MP4 videos up to 2GB in size."
    },
    {
      question: "How do I change my notification settings?",
      answer: "Go to Settings > Notifications to customize how and when you receive email alerts for post outcomes or account syncs."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2">Help Center</h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
          <Book className="w-4 h-4 text-primary" />
          Technical support and documentation hub
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-none border border-border h-auto md:h-11 gap-1 md:gap-0">
          <TabsTrigger value="faq" className="rounded-none font-bold text-[10px] uppercase tracking-widest">FAQ</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-none font-bold text-[10px] uppercase tracking-widest">Contact</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-none font-bold text-[10px] uppercase tracking-widest">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFaqs.length === 0 && (
                <p className="text-center text-gray-500 py-8">No results found for "{searchQuery}"</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="min-h-[100px] resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
                <CardDescription>
                  Alternative contact methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-none shadow-none border-border">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-500">support@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-none shadow-none border-border">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-none shadow-none border-border">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-500">Available 9 AM - 5 PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="text-left rounded-none border border-border">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                Give Feedback
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Tell us about your experience and how we can make ShipOS better.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="feedback-type" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feedback Type</Label>
                  <Select 
                    value={feedbackForm.type} 
                    onValueChange={(val) => setFeedbackForm({...feedbackForm, type: val})}
                  >
                    <SelectTrigger id="feedback-type" className="rounded-none border-border bg-background font-bold text-xs h-10 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none bg-background border-border">
                      <SelectItem value="bug" className="text-xs uppercase font-semibold">Bug Report</SelectItem>
                      <SelectItem value="feature" className="text-xs uppercase font-semibold">Feature Request</SelectItem>
                      <SelectItem value="improvement" className="text-xs uppercase font-semibold">UI/UX Improvement</SelectItem>
                      <SelectItem value="review" className="text-xs uppercase font-semibold">Review</SelectItem>
                      <SelectItem value="other" className="text-xs uppercase font-semibold">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Satisfaction Rating</Label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setFeedbackForm({...feedbackForm, rating: stars})}
                        className={cn(
                          "w-12 h-10 border font-bold text-xs transition-all rounded-none flex items-center justify-center shadow-none",
                          feedbackForm.rating === stars 
                            ? "bg-primary text-white border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5" 
                            : "bg-background text-foreground border-border hover:border-foreground"
                        )}
                      >
                        {stars} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="feedback-comment" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Comments & Details</Label>
                  <Textarea
                    id="feedback-comment"
                    placeholder="What did you like or dislike? Any specific suggestions?"
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                    className="min-h-[120px] resize-none rounded-none border-border bg-background font-bold text-xs"
                    required
                  />
                </div>

                <Button type="submit" className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/95 font-bold uppercase tracking-widest text-[10px] h-11 px-5 shadow-none">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Help;
