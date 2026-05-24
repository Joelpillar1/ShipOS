import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-8 border border-primary/20">
          <AlertTriangle className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-7xl font-black tracking-tighter text-foreground mb-4">404</h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] mb-10">
          Coordinate not found in workspace
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none flex items-center justify-center gap-3"
          >
            <Twitter className="w-4 h-4" />
            Back to Command Center
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full h-12 text-muted-foreground hover:text-foreground rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Previous Sector
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Invalid Route: {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
