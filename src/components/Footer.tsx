import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#141413] text-[#faf9f5] py-16 border-t border-neutral-800 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/logo-white.png" alt="ShipOS Logo" className="h-9 w-auto" />
            </div>
            <p className="text-sm text-[#b0aea5] leading-relaxed font-normal">
              Your all-in-one social media command center. Create once, publish everywhere — across X, LinkedIn, Instagram, TikTok and more.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a
                href="https://twitter.com/ship_os"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ShipOS on X"
                className="text-[#b0aea5] hover:text-[#d97757] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/shipos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ShipOS on LinkedIn"
                className="text-[#b0aea5] hover:text-[#d97757] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-[#faf9f5] border-b border-neutral-800 pb-2">Features</h4>
            <ul className="space-y-2 text-sm font-normal text-[#b0aea5]">
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Multi-Platform Composer</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Bulk Scheduler</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">AI Content Studio</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Visual Calendar</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Growth Analytics</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-[#faf9f5] border-b border-neutral-800 pb-2">Free Tools</h4>
            <ul className="space-y-2 text-sm font-normal text-[#b0aea5]">
              <li><Link to="/free-tools" className="hover:text-[#faf9f5] font-bold text-[#d97757] transition-colors tracking-wide flex items-center gap-1">All Free Tools <span className="text-xs">→</span></Link></li>
              <li><Link to="/linkedin-hook-previewer" className="hover:text-[#faf9f5] transition-colors tracking-wide">LinkedIn Hook Previewer</Link></li>
              <li><Link to="/linkedin-text-formatter" className="hover:text-[#faf9f5] transition-colors tracking-wide">LinkedIn Text Formatter</Link></li>
              <li><Link to="/x-thread-formatter" className="hover:text-[#faf9f5] transition-colors tracking-wide">X Thread Formatter</Link></li>
              <li><Link to="/instagram-engagement-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">Instagram Engagement Calculator</Link></li>
              <li><Link to="/social-post-limit-checker" className="hover:text-[#faf9f5] transition-colors tracking-wide">Social Post Limit Checker</Link></li>
              <li><Link to="/tiktok-money-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">TikTok Money Calculator</Link></li>
              <li><Link to="/youtube-engagement-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">YouTube Engagement Calculator</Link></li>
              <li><Link to="/linkedin-engagement-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">LinkedIn Engagement Calculator</Link></li>
              <li><Link to="/x-engagement-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">X Engagement Calculator</Link></li>
              <li><Link to="/facebook-engagement-calculator" className="hover:text-[#faf9f5] transition-colors tracking-wide">Facebook Engagement Calculator</Link></li>
              <li><Link to="/instagram-carousel-splitter" className="hover:text-[#faf9f5] transition-colors tracking-wide">Instagram Carousel Splitter</Link></li>
              <li><Link to="/instagram-grid-maker" className="hover:text-[#faf9f5] transition-colors tracking-wide">Instagram Grid Maker</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-[#faf9f5] border-b border-neutral-800 pb-2">Use Cases</h4>
            <ul className="space-y-2 text-sm font-normal text-[#b0aea5]">
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Content Creators</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Marketing Teams</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Small Businesses</a></li>
              <li><a href="/#features" className="hover:text-[#faf9f5] transition-colors tracking-wide">Agencies</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-[#faf9f5] border-b border-neutral-800 pb-2">Compare</h4>
            <ul className="space-y-2 text-sm font-normal text-[#b0aea5]">
              <li><Link to="/compare/buffer" className="hover:text-[#faf9f5] transition-colors tracking-wide">ShipOS vs Buffer</Link></li>
              <li><Link to="/compare/hootsuite" className="hover:text-[#faf9f5] transition-colors tracking-wide">ShipOS vs Hootsuite</Link></li>
            </ul>
          </div>


          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-[#faf9f5] border-b border-neutral-800 pb-2">Platform</h4>
            <ul className="space-y-2 text-sm font-normal text-[#b0aea5]">
              <li className="flex items-center tracking-wide"><Linkedin className="w-3.5 h-3.5 mr-2 text-[#0077B5]" /> LinkedIn</li>
              <li className="flex items-center tracking-wide"><Instagram className="w-3.5 h-3.5 mr-2 text-[#E1306C]" /> Instagram</li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-current" viewBox="0 0 16 16">
                  <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                </svg>
                Threads
              </li>
              <li className="flex items-center tracking-wide"><Twitter className="w-3.5 h-3.5 mr-2 text-foreground" /> X (Twitter)</li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-[#0285FF]" viewBox="0 0 320 286">
                  <path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/>
                </svg>
                Bluesky
              </li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                TikTok
              </li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-[#BD081C]" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" />
                </svg>
                Pinterest
              </li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </li>
              <li className="flex items-center tracking-wide">
                <svg className="w-3.5 h-3.5 mr-2 fill-[#FF0000]" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-sm font-normal text-[#b0aea5]/80 tracking-wider flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 ShipOS. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/terms" className="hover:text-[#faf9f5] cursor-pointer">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#faf9f5] cursor-pointer">Privacy Protocol</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[#faf9f5] cursor-pointer">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
