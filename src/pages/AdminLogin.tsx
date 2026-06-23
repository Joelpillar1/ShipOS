import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CustomCaptcha } from '@/components/CustomCaptcha';

const AdminLogin = () => {
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [isVerified, setIsVerified] = useState(false);
 const [formData, setFormData] = useState({
 email: '',
 password: ''
 });
 
 const navigate = useNavigate();
 const { user, signInWithEmail, signOut, isMockMode } = useAuth();

 // If already logged in as a valid admin, redirect automatically
 useEffect(() => {
 if (user) {
 const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAILS ?? '';
 const adminEmails = rawAdminEmails
 .split(',')
 .map((e) => e.trim().toLowerCase())
 .filter(Boolean);
 
 const userEmail = (user.email ?? '').toLowerCase();
 const isAdmin = isMockMode || (adminEmails.length > 0 && adminEmails.includes(userEmail));

 if (isAdmin) {
 navigate('/admin', { replace: true });
 }
 }
 }, [user, isMockMode, navigate]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 // 1. Sign in the user via standard auth
 const res = await signInWithEmail(formData.email, formData.password);
 
 if (res.success) {
 // 2. We need to check if they have admin access
 const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAILS ?? '';
 const adminEmails = rawAdminEmails
 .split(',')
 .map((email) => email.trim().toLowerCase())
 .filter(Boolean);

 // Fetch user object post-signin
 // We know we can read the raw email from the formData since it's an email login
 const loggedInEmail = formData.email.trim().toLowerCase();
 const isAdmin = isMockMode || adminEmails.includes(loggedInEmail);

 if (!isAdmin) {
 // Immediately sign out this unauthorized user
 await signOut();
 toast.error('Access Denied: This account is not authorized as an administrator.');
 setIsLoading(false);
 return;
 }

 toast.success('Admin authorization successful');
 navigate('/admin', { replace: true });
 } else {
 toast.error(res.error || 'Invalid credentials');
 }
 } catch (err: any) {
 toast.error(err.message || 'An unexpected error occurred during admin sign-in');
 } finally {
 setIsLoading(false);
 }
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value
 });
 };

 return (
 <div className="min-h-screen relative bg-background flex items-center justify-center px-4 overflow-hidden text-foreground">
 {/* Background Matrix/Grid Aesthetic */}
 <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
 
 {/* Subtle Glowing Accents */}
 <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

 {/* Back button to public area */}
 <Button
 variant="ghost"
 className="absolute top-6 left-6 text-[10px] font-bold tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none gap-2"
 onClick={() => navigate("/")}
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 RETURN TO SHIPOS
 </Button>

 <div className="w-full max-w-md relative z-10">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-none mb-4 animate-pulse">
 <ShieldCheck className="w-8 h-8 text-primary" />
 </div>
 <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center justify-center gap-2">
 SHIPOS <span className="text-primary font-light">SYSTEM ACCESS</span>
 </h1>
 <p className="text-[9px] font-bold text-muted-foreground mt-2">
 ADMINISTRATOR AUTHENTICATION GATEWAY
 </p>
 </div>

 <Card className="border border-border bg-card/85 backdrop-blur-xl shadow-2xl rounded-none overflow-hidden">
 <CardContent className="p-8">
 {isMockMode && (
 <div className="mb-6 p-3 bg-primary/5 border border-primary/20 flex gap-2.5 items-start">
 <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
 <div className="text-[10px] text-muted-foreground leading-relaxed">
 <span className="text-primary font-bold">MODE: DEMO/DEVELOPMENT</span>
 <br />
 Any valid email & password &gt; 6 chars will bypass authentication checks for local preview.
 </div>
 </div>
 )}

 {!isMockMode && (!import.meta.env.VITE_ADMIN_EMAILS) && (
 <div className="mb-6 p-3 bg-yellow-500/5 border border-yellow-500/20 flex gap-2.5 items-start">
 <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
 <div className="text-[10px] text-muted-foreground leading-relaxed">
 <span className="text-yellow-500 font-bold">WARNING: ACCESS LOCKED</span>
 <br />
 No administrator emails are configured. Set <code className="text-yellow-500 bg-muted px-1 py-0.5 rounded font-sans">VITE_ADMIN_EMAILS</code> in your environment parameters.
 </div>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="space-y-2">
 <Label htmlFor="email" className="text-[10px] font-bold tracking-widest text-muted-foreground">
 ADMINISTRATOR EMAIL
 </Label>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 id="email"
 name="email"
 type="email"
 placeholder="admin@shipos.com"
 value={formData.email}
 onChange={handleInputChange}
 className="pl-10 h-11 bg-muted/30 border-border text-foreground focus:border-primary focus:ring-primary/20 rounded-none shadow-none text-xs placeholder:text-muted-foreground/30"
 required
 />
 </div>
 </div>
 
 <div className="space-y-2">
 <Label htmlFor="password" className="text-[10px] font-bold tracking-widest text-muted-foreground">
 SECURITY CREDENTIALS
 </Label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 id="password"
 name="password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••••••"
 value={formData.password}
 onChange={handleInputChange}
 className="pl-10 pr-10 h-11 bg-muted/30 border-border text-foreground focus:border-primary focus:ring-primary/20 rounded-none shadow-none text-xs placeholder:text-muted-foreground/30"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 >
 {showPassword ? (
 <EyeOff className="w-4 h-4" />
 ) : (
 <Eye className="w-4 h-4" />
 )}
 </button>
 </div>
 </div>
 
 <div className="pt-2">
 <CustomCaptcha onVerify={setIsVerified} />
 </div>

 <Button 
 type="submit" 
 disabled={isLoading || !isVerified} 
 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-none text-[10px] font-bold tracking-widest shadow-none border border-primary/20"
 >
 {isLoading ? 'INITIATING SYSTEM HANDSHAKE...' : 'AUTHORIZE ADMIN ACCESS'}
 </Button>
 </form>
 </CardContent>
 </Card>
 
 <div className="text-center mt-6">
 <p className="text-[9px] text-muted-foreground/60 mt-2">
 SECURE ENCRYPTED NODE CONNECTION
 </p>
 </div>
 </div>
 </div>
 );
};

export default AdminLogin;
