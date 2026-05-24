
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Book, Video, Mail, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
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

  const faqs = [
    {
      question: "How do I create a new tweet?",
      answer: "You can create a new tweet by clicking the 'Create Tweet' button in the Quick Actions section or by using the tweet composer in Content Studio."
    },
    {
      question: "How do I schedule tweets?",
      answer: "In the tweet composer, select a date and time using the Schedule option. Your tweet will be automatically posted at the specified time."
    },
    {
      question: "What is a voice tweet?",
      answer: "Voice tweets allow you to record audio messages that are transcribed to text. You can edit the transcription before posting."
    },
    {
      question: "How do I set up automation rules?",
      answer: "Go to the Automation page and click 'Create Rule'. You can set up auto-replies, auto-follows, and other automated actions."
    },
    {
      question: "Can I edit my drafts?",
      answer: "Yes! Go to Content Studio > Drafts tab where you can view and edit all your saved drafts."
    },
    {
      question: "How do I view my analytics?",
      answer: "Visit the Analytics page to see detailed insights about your tweet performance, engagement metrics, and growth statistics."
    },
    {
      question: "What file formats are supported for media uploads?",
      answer: "We support JPG, PNG, GIF images and MP4 videos up to 2GB in size."
    },
    {
      question: "How do I change my notification settings?",
      answer: "Go to Settings > Notifications to customize how and when you receive notifications."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using the platform",
      duration: "5 min read",
      category: "Beginner"
    },
    {
      title: "Creating Your First Tweet",
      description: "Step-by-step guide to posting content",
      duration: "3 min read",
      category: "Beginner"
    },
    {
      title: "Advanced Scheduling Features",
      description: "Master the art of content planning",
      duration: "8 min read",
      category: "Advanced"
    },
    {
      title: "Analytics Deep Dive",
      description: "Understanding your performance metrics",
      duration: "10 min read",
      category: "Advanced"
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

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-none border border-border h-11">
          <TabsTrigger value="faq" className="rounded-none font-bold text-[10px] lowercase tracking-widest">faq</TabsTrigger>
          <TabsTrigger value="tutorials" className="rounded-none font-bold text-[10px] uppercase tracking-widest">Tutorials</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-none font-bold text-[10px] uppercase tracking-widest">Contact</TabsTrigger>
          <TabsTrigger value="resources" className="rounded-none font-bold text-[10px] uppercase tracking-widest">Resources</TabsTrigger>
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

        <TabsContent value="tutorials">
          <div className="grid gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="w-5 h-5" />
                        {tutorial.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {tutorial.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{tutorial.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{tutorial.duration}</span>
                    <Button variant="outline" size="sm">
                      Read Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        <TabsContent value="resources">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Watch step-by-step video guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Coming soon! We're working on creating comprehensive video tutorials to help you make the most of our platform.</p>
                <Button variant="outline">
                  Subscribe for Updates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Detailed technical documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-none shadow-none border-border">
                    <span>API Documentation</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-none shadow-none border-border">
                    <span>Integration Guide</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-none shadow-none border-border">
                    <span>Best Practices</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
