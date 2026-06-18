import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      if (!supabase) {
        // Demo / mock mode — just simulate success so the flow can be tested
        await new Promise((r) => setTimeout(r, 800));
        setSent(true);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Supabase will append `?code=...` to this URL. The ResetPassword page
        // exchanges that code for a session so the user can set a new password.
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-background flex items-center justify-center px-4">
      <SEO title="Reset Password" description="Reset your ShipOS account password." path="/forgot-password" noindex />
      {/* Back button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-none gap-2"
        onClick={() => navigate('/login')}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Login
      </Button>

      <div className="w-full max-w-md">
        {/* Logo + heading */}
        <div className="text-center mb-6">
          <img
            src="/logo-black.png"
            alt="ShipOS Logo"
            className="h-8 w-auto mx-auto mb-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer dark:hidden"
            onClick={() => navigate('/')}
          />
          <img
            src="/logo-white.png"
            alt="ShipOS Logo"
            className="h-8 w-auto mx-auto mb-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer hidden dark:block"
            onClick={() => navigate('/')}
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {sent ? 'Check your inbox' : 'Reset your password'}
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
            {sent
              ? 'A reset link is on its way'
              : 'We\'ll send you a secure reset link'}
          </p>
        </div>

        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <CardContent className="p-6 pt-6">
            {sent ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    We sent a password reset link to{' '}
                    <span className="text-primary font-bold">{email}</span>
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                    Click the link in the email to set a new password. If it doesn't
                    arrive within a couple of minutes, check your spam folder.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-10 rounded-none border-border text-[10px] font-bold uppercase tracking-widest shadow-none mt-2"
                  onClick={() => { setSent(false); setEmail(''); }}
                >
                  Send to a different email
                </Button>

                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline font-bold">
                    Sign in
                  </Link>
                </p>
              </div>
            ) : (
              /* ── Email form state ── */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-email"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-muted/30 border-border focus:border-primary focus:ring-primary rounded-none shadow-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline font-bold">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
