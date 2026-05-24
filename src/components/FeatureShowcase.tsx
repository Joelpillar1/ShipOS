
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Twitter } from "lucide-react";

export const FeatureShowcase = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Grow on Twitter
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From content creation to audience insights, XCommand handles every aspect of your Twitter growth strategy.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="bg-white border-0 shadow-none border border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-none flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">AI Tweet Creation</CardTitle>
              <CardDescription>
                Transform your ideas into engaging content with AI-powered assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-none mr-3"></div>
                  Voice-to-tweet generation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-none mr-3"></div>
                  Thread creation from one idea
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-none mr-3"></div>
                  Viral format suggestions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-none mr-3"></div>
                  Tone & voice consistency
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-none border border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-none flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Smart Automation</CardTitle>
              <CardDescription>
                Intelligent engagement that works while you sleep
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-none mr-3"></div>
                  Context-aware auto-replies
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-none mr-3"></div>
                  Welcome DM sequences
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-none mr-3"></div>
                  Optimal timing for maximum reach
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-none mr-3"></div>
                  Engagement-boosting interactions
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-none border border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-none flex items-center justify-center mb-4">
                <Twitter className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Growth Analytics</CardTitle>
              <CardDescription>
                Data-driven insights to accelerate your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-none mr-3"></div>
                  Real-time follower tracking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-none mr-3"></div>
                  Tweet performance insights
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-none mr-3"></div>
                  Audience behavior analysis
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-none mr-3"></div>
                  Competitor monitoring
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
