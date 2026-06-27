import { useNavigate } from"react-router-dom";
import { Button } from"@/components/ui/button";
import { ArrowRight, Eye, ShieldCheck, HelpCircle } from"lucide-react";
import { useEffect } from"react";
import { Footer } from"@/components/Footer";
import { SEO } from"@/components/SEO";
import { breadcrumbSchema } from"@/lib/seo";
import { useTheme } from"next-themes";
import { ThemeToggle } from"../components/ThemeToggle";

const Privacy = () => {
 const { resolvedTheme } = useTheme();
 const isDark = resolvedTheme ==="dark";
 const navigate = useNavigate();

 useEffect(() => {
 // Ensure page starts at the top
 window.scrollTo(0, 0);
 }, []);

 const sections = [
 { id:"1", title:"1. Information We Collect", desc:"Data we collect directly or from social integrations" },
 { id:"2", title:"2. How We Use Your Data", desc:"Purpose of details processing and posting" },
 { id:"3", title:"3. OAuth Connections & Social Tokens", desc:"Security and storage of social credentials" },
 { id:"4", title:"4. YouTube API Services", desc:"Special disclosures for connected YouTube channels" },
 { id:"5", title:"5. Login & Cookies", desc:"Magic link details and cookie use" },
 { id:"6", title:"6. Data Sharing & Subprocessors", desc:"Infrastructure, email, and payment providers" },
 { id:"7", title:"7. Data Security", desc:"How we protect database records" },
 { id:"8", title:"8. Your Choices & Revocation", desc:"Disconnecting apps and requesting account deletion" },
 { id:"9", title:"9. Contact Information", desc:"Email support for privacy inquiries" },
 ];

 const scrollToSection = (id: string) => {
 const el = document.getElementById(id);
 if (el) {
 const top = el.getBoundingClientRect().top + window.scrollY - 110;
 window.scrollTo({ top, behavior:"smooth" });
 }
 };

 return (
 <div 
 className="min-h-screen text-foreground relative lg:overflow-x-visible overflow-x-hidden font-sans bg-background"
 style={{
 backgroundColor: isDark ?"transparent" :"#FAF7F5",
 }}
 >
 <SEO
 title="Privacy Policy"
 description="The ShipOS Privacy Policy explains what data we collect, how OAuth social connections are secured, how we use and protect your information, and the controls you have over your data."
 path="/privacy"
 jsonLd={breadcrumbSchema([
 { name:"Home", path:"/" },
 { name:"Privacy Policy", path:"/privacy" },
 ])}
 />
 {/* Background Dot Pattern & Ambient Gradients */}
 <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

 {/* Styled Grid Line Border Accents */}
 <div className="absolute top-20 left-0 right-0 h-[1px] bg-border/20 pointer-events-none" />
 <div className="absolute top-0 bottom-0 left-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />
 <div className="absolute top-0 bottom-0 right-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />

 {/* Top Navbar */}
 <nav className="fixed w-full z-50 bg-[#FAF7F5]/85 dark:bg-[#191715]/85 backdrop-blur-md border-b border-border/45 dark:border-neutral-800/60" style={{ top: 'var(--banner-h, 0px)', transition: 'top 0.35s ease' }}>
 <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
 <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate("/")}>
 <img src="/logo-black.png" alt="ShipOS Logo" className="h-9 w-auto hover:scale-[1.02] transition-all duration-200 dark:hidden" />
 <img src="/logo-white.png" alt="ShipOS Logo" className="h-9 w-auto hover:scale-[1.02] transition-all duration-200 hidden dark:block" />
 </div>

 <div className="hidden md:flex items-center space-x-8">
 <a href="/#features" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Features</a>
 <a href="/#bento" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Platforms</a>
 <a href="/#faq" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">FAQ</a>
 <a href="/#pricing" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">Pricing</a>
 </div>

 <div className="hidden md:flex items-center space-x-6">
 <ThemeToggle />
 <a href="/login" className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-[#d75a34] transition-colors">Login</a>
 <Button
 className="bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none shadow-sm hover:shadow transition-all font-semibold text-sm px-5 py-2.5 h-auto border-none animate-pulse inline-flex items-center gap-1.5"
 style={{ animationDuration: '3s' }}
 onClick={() => navigate("/signup")}
 >
 Try it for $0 <ArrowRight className="w-4 h-4" />
 </Button>
 </div>
 </div>
 </nav>

 {/* Hero Banner Section */}
 <header className="pb-12 px-6 lg:px-12 relative z-10 max-w-7xl mx-auto text-left border-b border-border/15 dark:border-neutral-800/40" style={{ paddingTop: 'calc(var(--banner-h, 0px) + 9rem)' }}>
 <div className="max-w-4xl">
 <div className="inline-flex items-center gap-2 border border-black dark:border-neutral-800 rounded-none p-1 pr-4 bg-white dark:bg-[#1f1d1b] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(215,90,52,0.3)] mb-6">
 <div className="bg-[#d75a34] text-white text-[11px] font-bold px-3 py-1 rounded-none tracking-wider">
 Legal
 </div>
 <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 tracking-widest">
 ShipOS Privacy Protocol
 </span>
 </div>
 <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] dark:text-neutral-100 tracking-tight leading-none mb-4">
 Privacy Policy
 </h1>
 <p className="text-gray-600 dark:text-neutral-400 text-sm font-bold tracking-widest">
 Last Updated: March 3, 2026
 </p>
 </div>
 </header>

 {/* Two Column Layout */}
 <main className="py-16 px-6 lg:px-12 relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
 {/* Left column: Sticky Outline */}
 <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit hidden lg:block">
 <div className="bg-white/70 dark:bg-[#1f1d1b]/70 border border-border/40 dark:border-neutral-800/80 p-6 rounded-none">
 <h3 className="text-sm font-bold tracking-wider text-black dark:text-neutral-100 mb-4 flex items-center gap-2">
 <Eye className="w-4.5 h-4.5 text-[#d75a34]" />
 Policy Sections
 </h3>
 <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar">
 {sections.map((sect) => (
 <button
 key={sect.id}
 onClick={() => scrollToSection(sect.id)}
 className="w-full text-left p-2.5 hover:bg-[#FAF7F5] dark:hover:bg-[#191715] border border-transparent hover:border-black dark:hover:border-neutral-700 transition-all flex flex-col rounded-none group"
 >
 <span className="text-xs font-bold text-black dark:text-neutral-200 group-hover:text-[#d75a34]">
 {sect.title}
 </span>
 <span className="text-[10px] text-muted-foreground font-medium truncate w-full">
 {sect.desc}
 </span>
 </button>
 ))}
 </div>
 </div>

 <div className="bg-white/50 dark:bg-[#1f1d1b]/50 border border-border/40 dark:border-neutral-800/80 p-5 rounded-none text-left">
 <p className="text-[11px] font-bold text-muted-foreground tracking-widest leading-relaxed mb-3">
 Data Security Standards
 </p>
 <p className="text-xs text-gray-600 dark:text-neutral-400 dark:text-neutral-400 leading-relaxed mb-4">
 We encrypt all tokens in transit and at rest. We never sell, lease, or rent your database records.
 </p>
 </div>
 </aside>

 {/* Right column: Policy Content */}
 <article className="lg:col-span-8 space-y-8">
 <div className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-neutral-200 leading-relaxed">
 
 <section id="1" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">01</span>
 Information We Collect
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 To operate the ShipOS dashboard and offer multi-platform scheduling features, we collect several categories of information:
 </p>
 <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1.5 mb-4">
 <li><strong>Verification Details:</strong> Your email address and password, provided during signup or Google Sign-In authentication.</li>
 <li><strong>Scheduling Content:</strong> Draft content, text blocks, image tags, video files, scheduled timings, and publishing sequences composed in the composer interface.</li>
 <li><strong>Usage Quotas:</strong> Timestamps of scheduler executions, remaining AI credit counts, and social channel connection status.</li>
 <li><strong>Billing Data:</strong> Billing email, payment identifiers, and plan categories processed via Dodo Payments. We never store credit card numbers directly on our database.</li>
 </ul>
 </section>

 <section id="2" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">02</span>
 How We Use Your Data
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 We process your information to deliver, monitor, and optimize the ShipOS platform:
 </p>
 <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1.5 mb-4">
 <li>Managing your dashboard session and validating system settings.</li>
 <li>Routing queued content to your connected profiles at the designated date and time.</li>
 <li>Tracking AI request counts to meter and adjust your subscription tier's AI credits.</li>
 <li>Sending system alerts, setup notifications, and transaction invoices.</li>
 <li>Investigating scheduling failures or API connectivity issues.</li>
 </ul>
 </section>

 <section id="3" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">03</span>
 OAuth Connections &amp; Social Tokens
 </h2>

 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 When you connect accounts (X/Twitter, LinkedIn, Instagram, TikTok, Threads, Pinterest, Bluesky), social access tokens and channel identifiers are secure-stored on the database in compliance with OAuth protocols.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 These access tokens are used solely to authenticate API posting requests on your behalf and are never shared with other users or advertising platforms.
 </p>
 </section>

 <section id="4" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">04</span>
 YouTube API Services
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 ShipOS enables publishing to YouTube using YouTube API Services.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 When you connect a YouTube channel to ShipOS, the service fetches and stores Authorized Data returned by YouTube (specifically, channel names, account profile icons, and upload permissions). 
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 For details on how Google processes user privacy, please refer to the <strong>Google Privacy Policy</strong> at <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline font-bold">http://www.google.com/policies/privacy</a>.
 </p>
 </section>

 <section id="5" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">05</span>
 Login &amp; Cookies
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 Authentication on ShipOS is conducted via email and password credentials. We store secure password hashes to verify your identity.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 We store browser cookies and local storage tokens strictly to maintain active sessions, track login status, and remember preferences. We do not use cross-site tracking, third-party advertising cookies, or data brokers.
 </p>
 </section>

 <section id="6" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">06</span>
 Data Sharing &amp; Subprocessors
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 We share data with infrastructure partners only to the extent necessary to deliver the dashboard service:
 </p>
 <ol className="list-decimal pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-2 mb-4">
 <li><strong>Supabase:</strong> For cloud hosting of our databases and project tables.</li>
 <li><strong>Vercel / Render:</strong> For hosting web application layouts and scheduler scripts.</li>
 <li><strong>Post For Me API:</strong> To route and post scheduling packages to social media channels.</li>
 <li><strong>Loops:</strong> To transmit platform updates and invoices to your email inbox.</li>
 <li><strong>Dodo Payments:</strong> For handling subscription billing, payments, and invoice records.</li>
 </ol>
 <p className="text-sm text-gray-600 dark:text-neutral-400 font-bold">
 We do not sell, rent, or trade your data to third parties under any circumstances.
 </p>
 </section>

 <section id="7" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">07</span>
 Data Security
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 All communications on ShipOS are encrypted in transit via Transport Layer Security (HTTPS).
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 Access to cloud server environments is strictly limited to authorization rules utilizing multi-factor security credentials. Social tokens are encrypted prior to being written into database tables.
 </p>
 </section>

 <section id="8" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">08</span>
 Your Choices &amp; Revocation
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 You maintain complete command over your data footprints:
 </p>
 <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1.5 mb-4">
 <li><strong>Disconnecting Accounts:</strong> You can disconnect any connected social platform inside your ShipOS settings dashboard at any time. We will immediately delete connected tokens.</li>
 <li><strong>Revoking YouTube Access:</strong> You can revoke access granted to YouTube API Services at any time via your Google Security Settings page at: <a href="https://myaccount.google.com/connections?filters=3,4&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline font-bold">https://myaccount.google.com/connections</a>.</li>
 <li><strong>Account Deletion:</strong> You can delete your ShipOS profile at any time. Deletion removes all connected records, social profiles, and drafts from active databases within 30 days.</li>
 </ul>
 </section>

 <section id="9" className="scroll-m-28">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">09</span>
 Contact Information
 </h2>
 <div className="bg-[#FAF7F5] dark:bg-[#191715] border border-black/10 dark:border-neutral-800/60 p-5 rounded-none flex items-start gap-4">
 <HelpCircle className="w-5 h-5 text-[#d75a34] shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-bold text-black tracking-wider mb-1">
 Privacy Support Desk
 </p>
 <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
 For requests regarding data exports, profile deletions, or general privacy policies:
 <br />
 <span className="font-bold text-black">privacy@shipos.com</span>
 </p>
 </div>
 </div>
 </section>

 </div>
 </article>
 </main>

 <Footer />
 </div>
 );
};

export default Privacy;
