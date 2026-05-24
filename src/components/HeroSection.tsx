
import { Button } from "@/components/ui/button";
import { Twitter, TrendingUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-none text-sm font-medium mb-6">
            <Twitter className="w-4 h-4 mr-2" />
            AI-Powered Twitter Growth Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your Voice Into 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Viral Tweets</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered content creation + smart automation = Twitter growth on autopilot. 
            Speak your ideas, let AI craft engaging tweets, and watch your audience grow.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg" asChild>
            <Link to="/create-post">Start Growing on X</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
            See Live Demo
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="flex flex-col items-center p-6 bg-white rounded-none shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-none flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Voice to Tweet</h3>
            <p className="text-gray-600 text-sm">Speak naturally, AI creates engaging tweets</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-none shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-none flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Automation</h3>
            <p className="text-gray-600 text-sm">Context-aware replies and scheduling</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-none shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-none flex items-center justify-center mb-4">
              <Twitter className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Growth Analytics</h3>
            <p className="text-gray-600 text-sm">Real-time insights and performance tracking</p>
          </div>
        </div>
      </div>
    </section>
  );
};
