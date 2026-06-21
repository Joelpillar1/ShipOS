import { useNavigate } from"react-router-dom";
import { Button } from"@/components/ui/button";
import { ArrowRight, FileText, Shield, Scale, HelpCircle } from"lucide-react";
import { useEffect } from"react";
import { Footer } from"@/components/Footer";
import { SEO } from"@/components/SEO";
import { breadcrumbSchema } from"@/lib/seo";
import { useTheme } from"next-themes";
import { ThemeToggle } from"../components/ThemeToggle";

const Terms = () => {
 const { resolvedTheme } = useTheme();
 const isDark = resolvedTheme ==="dark";
 const navigate = useNavigate();

 useEffect(() => {
 // Ensure page starts at the top
 window.scrollTo(0, 0);
 }, []);

 const sections = [
 { id:"1", title:"1. Agreement to Terms", desc:"Basic terms and conditions of usage" },
 { id:"2", title:"2. Eligibility & Accounts", desc:"Requirements for setting up a ShipOS profile" },
 { id:"3", title:"3. Use of Services & Content", desc:"User content licenses and permissions" },
 { id:"4", title:"4. Third-Party Integrations & APIs", desc:"Post For Me API & YouTube API Services" },
 { id:"5", title:"5. Subscription Tiers & AI Credits", desc:"Billing cycle details and usage quotas" },
 { id:"6", title:"6. Prohibited Conduct", desc:"What you cannot do with the platform" },
 { id:"7", title:"7. Uptime, Availability & Fees", desc:"Billing rules, refunds, and maintenance" },
 { id:"8", title:"8. Disclaimers & Warranties", desc:"Standard AS-IS service limitations" },
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
 title="Terms of Service"
 description="Read the ShipOS Terms of Service — account eligibility, content licenses, third-party API integrations, subscription tiers, AI credits, and acceptable use of the platform."
 path="/terms"
 jsonLd={breadcrumbSchema([
 { name:"Home", path:"/" },
 { name:"Terms of Service", path:"/terms" },
 ])}
 />
 {/* Background Dot Pattern & Ambient Gradients */}
 <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

 {/* Styled Grid Line Border Accents */}
 <div className="absolute top-20 left-0 right-0 h-[1px] bg-border/20 pointer-events-none" />
 <div className="absolute top-0 bottom-0 left-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />
 <div className="absolute top-0 bottom-0 right-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />

 {/* Top Navbar */}
 <nav className="fixed top-0 w-full z-50 bg-[#FAF7F5]/85 dark:bg-[#191715]/85 backdrop-blur-md border-b border-border/45 dark:border-neutral-800/60">
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
 <header className="pt-36 pb-12 px-6 lg:px-12 relative z-10 max-w-7xl mx-auto text-left border-b border-border/15 dark:border-neutral-800/40">
 <div className="max-w-4xl">
 <div className="inline-flex items-center gap-2 border border-black dark:border-neutral-800 rounded-none p-1 pr-4 bg-white dark:bg-[#1f1d1b] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(215,90,52,0.3)] mb-6">
 <div className="bg-[#d75a34] text-white text-[11px] font-bold px-3 py-1 rounded-none tracking-wider">
 Legal
 </div>
 <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 tracking-widest">
 ShipOS Platform Terms
 </span>
 </div>
 <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] dark:text-neutral-100 tracking-tight leading-none mb-4">
 Terms of Service
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
 <Scale className="w-4.5 h-4.5 text-[#d75a34]" />
 Document Navigation
 </h3>
 <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar">
 {sections.map((sect) => (
 <button
 key={sect.id}
 onClick={() => scrollToSection(sect.id)}
 className="w-full text-left p-2.5 hover:bg-[#FAF7F5] dark:hover:bg-[#191715] border border-transparent hover:border-black dark:hover:border-neutral-700 transition-all flex flex-col rounded-none group"
 >
 <span className="text-xs font-bold text-black dark:text-neutral-100 dark:text-neutral-200 group-hover:text-[#d75a34]">
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
 Need legal clarification?
 </p>
 <p className="text-xs text-gray-600 dark:text-neutral-400 dark:text-neutral-400 leading-relaxed mb-4">
 If you have any questions regarding these platform terms, please reach out directly to our support desk.
 </p>
 <Button
 variant="outline"
 className="w-full border border-[#d75a34] text-[#d75a34] rounded-none hover:bg-[#d75a34] hover:text-white font-bold text-xs tracking-wider transition-all h-10"
 onClick={() => navigate("/help")}
 >
 Contact Support
 </Button>
 </div>
 </aside>

 {/* Right column: Terms Content */}
 <article className="lg:col-span-8 space-y-8">
 <div className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-neutral-200 leading-relaxed">
 
 <section id="1" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">01</span>
 Agreement to Terms
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
 Welcome to <strong>ShipOS</strong> ("Service"), owned and operated by ShipOS Inc. By accessing, signing up for, or using our social media manager dashboard, including its bulk scheduler, automation utilities, and any related features, you agree to be bound by these Terms of Service ("Terms").
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 If you do not agree to all of these Terms, you are prohibited from using the Service. Please read them carefully before creating an account.
 </p>
 </section>

 <section id="2" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">02</span>
 Eligibility &amp; Accounts
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 To use ShipOS, you must be at least 18 years of age and fully capable of entering into binding legal contracts.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 You authenticate to ShipOS via email and password credentials or Google Sign-In. You agree that:
 </p>
 <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1 mb-4">
 <li>All profile details you provide are accurate, current, and true.</li>
 <li>You are solely responsible for all activities occurring under your account or using your session tokens.</li>
 <li>You will immediately notify support if you suspect unauthorized access or security breaches.</li>
 </ul>
 </section>

 <section id="3" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">03</span>
 Use of Services &amp; Content
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 ShipOS acts as a content orchestration platform. You retain all ownership, copyrights, and intellectual property rights in and to the content (text, graphics, images) you compose on our dashboard.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 By composing and queuing content on ShipOS, you grant us a worldwide, non-exclusive, royalty-free, limited license to store, format, transmit, and route your content to third-party social platforms solely for the purpose of executing the scheduling and publishing services you request.
 </p>
 </section>

 <section id="4" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">04</span>
 Third-Party Integrations &amp; APIs
 </h2>
 <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 mb-4 text-sm text-gray-700 dark:text-amber-300">
 <p className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-1.5">
 <Shield className="w-4 h-4" />
 Integration Protocol Notice
 </p>
 ShipOS connects with third-party social networks (including X/Twitter, LinkedIn, Instagram, Threads, and YouTube) utilizing the <strong>Post For Me API</strong> (operated by Day Moon Development LLC) as a middleware infrastructure service.
 </div>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 Your use of social integrations is subject to the terms and service rules of each platform. We are not responsible or liable for any policy changes, account restrictions, rate limits, or API bans enforced by third-party social networks.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 <strong>YouTube API Services:</strong> ShipOS integrates YouTube publishing features via YouTube API Services. By connecting your YouTube account, you agree to be bound by the <strong>YouTube Terms of Service</strong> located at <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline font-bold">https://www.youtube.com/t/terms</a> and the <strong>Google Privacy Policy</strong> located at <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline font-bold">http://www.google.com/policies/privacy</a>.
 </p>
 </section>

 <section id="5" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">05</span>
 Subscription Tiers &amp; AI Credits
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 Access to full scheduling and AI enhancement features is based on subscription plans (Starter, Creator, Pro). Payments are billed periodically (monthly or annually) via <strong>Dodo Payments</strong>.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 <strong>AI Credits Quota:</strong> AI content generation is metered via credits associated with your billing cycle:
 </p>
 <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1 mb-3">
 <li>Starter: 100 AI Credits per billing cycle</li>
 <li>Creator: 400 AI Credits per billing cycle</li>
 <li>Pro: Unlimited AI Credits (subject to fair-use policies)</li>
 </ul>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 One credit is consumed per successful AI prompt, enhancement, or hook generation. Unused credits do not roll over to the next cycle.
 </p>
 </section>

 <section id="6" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">06</span>
 Prohibited Conduct
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 You agree not to engage in any of the following prohibited behaviors:
 </p>
 <ol className="list-decimal pl-5 text-sm text-gray-600 dark:text-neutral-400 space-y-1.5 mb-4">
 <li>Attempting to bypass security blocks, reverse-engineer, or scrape data from ShipOS or Post For Me.</li>
 <li>Publishing illegal, fraudulent, harassing, defamatory, or abusive content to social networks.</li>
 <li>Abusing AI generator endpoints or attempting to intentionally exceed rate limits.</li>
 <li>Impersonating other creators, brands, or using connected tokens without appropriate authorization.</li>
 </ol>
 </section>

 <section id="7" className="scroll-m-28 border-b border-gray-100 dark:border-neutral-800/60 pb-8 mb-8">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">07</span>
 Uptime, Availability &amp; Fees
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
 We make commercial efforts to maintain 99.9% availability. However, the Service is reliant on third-party network services, cloud database hosts (Supabase), and social media API end-points. We do not guarantee uninterrupted access.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 Subscription payments are non-refundable unless required by law. Pricing schedules and fees may be adjusted with a 30-day notice via email or dashboard notification.
 </p>
 </section>

 <section id="8" className="scroll-m-28">
 <h2 className="text-2xl font-bold text-black dark:text-neutral-100 mb-4 flex items-center gap-2.5 sticky top-[80px] bg-[#FAF7F5] dark:bg-[#191715] z-10 py-3">
 <span className="bg-black dark:bg-neutral-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold">08</span>
 Disclaimers &amp; Warranties
 </h2>
 <p className="text-sm text-gray-600 dark:text-neutral-400 font-semibold mb-3">
 THE SERVICE IS PROVIDED"AS IS" AND"AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
 </p>
 <p className="text-sm text-gray-600 dark:text-neutral-400">
 ShipOS disclaims all implied warranties of merchantability, fitness for a particular purpose, non-infringement, or data accuracy. We do not warrant that scheduling or publishing will occur exactly at the millisecond selected due to platform queues, server load, or API latency.
 </p>
 </section>

 </div>
 </article>
 </main>

 <Footer />
 </div>
 );
};

export default Terms;
