import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CustomCaptcha } from '@/components/CustomCaptcha';
import { markOnboardingComplete } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';

const SignUp = () => {
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [isVerified, setIsVerified] = useState(false);
 const [formData, setFormData] = useState({
 email: '',
 password: ''
 });
 const navigate = useNavigate();
 const location = useLocation();
 const { signUpWithEmail, signInWithGoogle } = useAuth();

 const redirectTo = new URLSearchParams(location.search).get('redirect') || '/create-post';

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 try {
 const res = await signUpWithEmail(formData.email, formData.password);
 if (res.success) {
 if (res.requiresConfirmation) {
 // Stay on page and wait for them to confirm their email
 return;
 }
 const hasRedirect = new URLSearchParams(location.search).get('redirect');
 const finalDestination = hasRedirect ? redirectTo : '/onboarding';
 if (hasRedirect && finalDestination !== '/onboarding' && finalDestination !== '/create-post') {
 if (supabase) {
 const { data: { user } } = await supabase.auth.getUser();
 if (user) markOnboardingComplete(user);
 } else {
 const mockRaw = localStorage.getItem('shipos_mock_user');
 if (mockRaw) {
 try {
 const parsed = JSON.parse(mockRaw);
 if (parsed?.id) {
 localStorage.setItem(`shipos_onboarding_complete_${parsed.id}`, 'true');
 }
 } catch { /* ignore */ }
 }
 }
 }
 navigate(finalDestination);
 } else {
 toast.error(res.error || 'Registration failed');
 }
 } catch (err: any) {
 toast.error(err.message || 'An unexpected error occurred');
 } finally {
 setIsLoading(false);
 }
 };

 const handleGoogleSignUp = async () => {
 setIsLoading(true);
 try {
 const finalDestination = new URLSearchParams(location.search).get('redirect') ? redirectTo : '/onboarding';
 sessionStorage.setItem('shipos_oauth_redirect', finalDestination);
 const res = await signInWithGoogle(window.location.origin + '/create-post');
 if (res.success) {
 if (res.redirecting) {
 // Do not navigate immediately, the browser is redirecting to load google accounts
 return;
 }
 const saved = sessionStorage.getItem('shipos_oauth_redirect');
 sessionStorage.removeItem('shipos_oauth_redirect');
 navigate(saved || finalDestination);
 } else {
 toast.error(res.error || 'OAuth registration failed');
 }
 } catch (err: any) {
 toast.error(err.message || 'OAuth error occurred');
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
 <div className="min-h-screen relative bg-background flex items-center justify-center px-4 py-6">
 <SEO title="Sign Up" description="Create your free ShipOS account and start a 7-day trial of the all-in-one social media command center." path="/signup" noindex />
 <Button
 variant="onboardingGhost"
 className="absolute top-6 left-6 text-[10px] font-bold text-muted-foreground hover:text-foreground rounded-none gap-2"
 onClick={() => navigate("/")}
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Back Home
 </Button>

 <div className="w-full max-w-md">
 <div className="text-center mb-6">
 <img src="/logo-black.png" alt="ShipOS Logo" className="h-8 w-auto mx-auto mb-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer dark:hidden" onClick={() => navigate("/")} />
 <img src="/logo-white.png" alt="ShipOS Logo" className="h-8 w-auto mx-auto mb-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer hidden dark:block" onClick={() => navigate("/")} />
 <h1 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h1>
 <p className="text-sm font-bold text-muted-foreground mt-2">Start growing across all socials today</p>
 </div>

 <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
 <CardContent className="p-6 pt-6">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-4">
 <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground">Email Address</Label>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 id="email"
 name="email"
 type="email"
 placeholder="name@example.com"
 value={formData.email}
 onChange={handleInputChange}
 className="pl-10 h-10 bg-muted/30 border-border focus:border-primary focus:ring-primary rounded-none shadow-none"
 required
 />
 </div>
 </div>
 
 <div className="space-y-4">
 <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground">Password</Label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input
 id="password"
 name="password"
 type={showPassword ?"text" :"password"}
 placeholder="Create a password"
 value={formData.password}
 onChange={handleInputChange}
 className="pl-10 pr-10 h-10 bg-muted/30 border-border focus:border-primary focus:ring-primary rounded-none shadow-none"
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
 
 <CustomCaptcha onVerify={setIsVerified} />

 <Button type="submit" variant="onboardingDefault" disabled={isLoading || !isVerified} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-none text-[10px] font-bold shadow-none">
 {isLoading ? 'Creating Account...' : 'Create Account'}
 </Button>
 </form>

 <div className="mt-6">
 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <Separator className="w-full bg-border" />
 </div>
 <div className="relative flex justify-center text-[10px] font-bold">
 <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
 </div>
 </div>

 <Button
 type="button"
 variant="onboardingOutline"
 disabled={isLoading || !isVerified}
 onClick={handleGoogleSignUp}
 className="w-full mt-6 h-10 rounded-none border-border hover:bg-muted text-[10px] font-bold shadow-none"
 >
 <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
 </svg>
 {isLoading ? 'Connecting...' : 'Continue with Google'}
 </Button>
 </div>

 <p className="mt-6 text-center text-[10px] font-bold text-muted-foreground">
 Already have an account?{' '}
 <Link to={location.search ? `/login${location.search}` :"/login"} className="text-primary hover:underline font-bold">
 Sign in
 </Link>
 </p>
 </CardContent>
 </Card>

 <p className="mt-4 text-center text-[10px] font-bold text-muted-foreground leading-relaxed">
 By creating an account, you agree to our{' '}
 <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
 and{' '}
 <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
 </p>
 </div>
 </div>
 );
};

export default SignUp;
