
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/logo-black.png" 
            alt="ShipOS Logo" 
            className="h-8 w-auto"
          />
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-[#FF6154] transition-colors">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-[#FF6154] transition-colors">Pricing</a>
          <a href="#analytics" className="text-gray-600 hover:text-[#FF6154] transition-colors">Analytics</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white" asChild>
            <Link to="/create-post">Start Growing</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
