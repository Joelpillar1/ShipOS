import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/postStorage";
import { ArrowRight, Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [landingProfile, setLandingProfile] = useState<{ name: string; avatarUrl: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLandingProfile(null);
      return;
    }
    let active = true;
    const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';
    const fallbackAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
    getUserProfile().then((p) => {
      if (!active) return;
      setLandingProfile({ name: p?.name || fallbackName, avatarUrl: p?.avatarUrl || fallbackAvatar });
    });
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setLandingProfile((prev) => ({
          name: detail.name ?? prev?.name ?? fallbackName,
          avatarUrl: detail.avatarUrl ?? prev?.avatarUrl ?? fallbackAvatar,
        }));
      }
    };
    window.addEventListener('shipos_profile_updated', onUpdate);
    return () => {
      active = false;
      window.removeEventListener('shipos_profile_updated', onUpdate);
    };
  }, [user]);

  const landingInitials = (landingProfile?.name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-[#FAF7F5]/85 dark:bg-[#191715]/85 backdrop-blur-md border-b border-border/45 dark:border-neutral-800/60" style={{ top: 'var(--banner-h, 0px)', transition: 'top 0.35s ease' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleLogoClick}>
          <img src="/logo-black.png" alt="ShipOS Logo" className="h-9 w-auto hover:scale-[1.02] transition-all duration-200 dark:hidden" />
          <img src="/logo-white.png" alt="ShipOS Logo" className="h-9 w-auto hover:scale-[1.02] transition-all duration-200 hidden dark:block" />
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="/#features" onClick={(e) => handleLinkClick(e, 'features')} className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Features</a>
          <a href="/#bento" onClick={(e) => handleLinkClick(e, 'bento')} className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Platforms</a>
          <a href="/#faq" onClick={(e) => handleLinkClick(e, 'faq')} className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">FAQ</a>
          {location.pathname === "/pricing" ? (
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm font-medium text-gray-900 dark:text-neutral-100 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Pricing</a>
          ) : (
            <Link to="/pricing" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Pricing</Link>
          )}
          {location.pathname === "/free-tools" ? (
            <Link to="/free-tools" className="text-sm font-medium text-[#d75a34] transition-colors">Free Tools</Link>
          ) : (
            <Link to="/free-tools" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Free Tools</Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <ThemeToggle />
          {user ? (
            <a href="/create-post" className="flex items-center gap-2.5 group" aria-label="Go to dashboard">
              <span className="w-9 h-9 rounded-none border border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                {landingProfile?.avatarUrl ? (
                  <img src={landingProfile.avatarUrl} alt={landingProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-black text-foreground">{landingInitials}</span>
                )}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-foreground group-hover:text-[#d75a34] transition-colors">{landingProfile?.name || 'Account'}</span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-neutral-400">Go to dashboard</span>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 dark:text-neutral-400 group-hover:text-[#d75a34] group-hover:translate-x-0.5 transition-all" />
            </a>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-[#d75a34] transition-colors">Login</a>
              <Button
                className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none shadow-sm hover:shadow transition-all font-semibold text-sm px-5 py-2.5 h-auto border-none animate-pulse inline-flex items-center gap-1.5"
                style={{ animationDuration: '3s' }}
                onClick={() => navigate("/signup")}
              >
                Try it for $0 <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu controls */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="p-2 text-gray-700 dark:text-neutral-200 hover:text-[#d75a34] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/45 dark:border-neutral-800/60 bg-[#FAF7F5]/95 dark:bg-[#191715]/95 backdrop-blur-md">
          <div className="px-6 py-5 flex flex-col space-y-4">
            <a href="/#features" onClick={(e) => handleLinkClick(e, 'features')} className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">Features</a>
            <a href="/#bento" onClick={(e) => handleLinkClick(e, 'bento')} className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">Platforms</a>
            <a href="/#faq" onClick={(e) => handleLinkClick(e, 'faq')} className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">FAQ</a>
            {location.pathname === "/pricing" ? (
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-base font-medium text-gray-900 dark:text-neutral-100 hover:text-[#d75a34] transition-colors">Pricing</a>
            ) : (
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">Pricing</Link>
            )}
            {location.pathname === "/free-tools" ? (
              <Link to="/free-tools" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-950 dark:text-white hover:text-[#d75a34] transition-colors">Free Tools</Link>
            ) : (
              <Link to="/free-tools" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">Free Tools</Link>
            )}
            <div className="flex flex-col space-y-3 pt-3 border-t border-border/45 dark:border-neutral-800/60">
              {user ? (
                <a
                  href="/create-post"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 group"
                  aria-label="Go to dashboard"
                >
                  <span className="w-10 h-10 rounded-none border border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                    {landingProfile?.avatarUrl ? (
                      <img src={landingProfile.avatarUrl} alt={landingProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-foreground">{landingInitials}</span>
                    )}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-semibold text-foreground group-hover:text-[#d75a34] transition-colors">{landingProfile?.name || 'Account'}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">Go to dashboard</span>
                  </span>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-500 dark:text-neutral-400" />
                </a>
              ) : (
                <>
                  <a href="/login" className="text-base font-medium text-gray-700 dark:text-neutral-300 hover:text-[#d75a34] transition-colors">Login</a>
                  <Button
                    className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none shadow-sm hover:shadow transition-all font-semibold text-sm px-5 py-2.5 h-auto border-none inline-flex items-center justify-center gap-1.5"
                    onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}
                  >
                    Try it for $0 <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
