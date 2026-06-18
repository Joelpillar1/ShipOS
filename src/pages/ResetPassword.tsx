import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  // Supabase PKCE flow: the code is exchanged automatically by the client.
  // We only need to know whether the session is ready.
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // When the user arrives via the reset link Supabase emails them, the URL
  // contains a `code` parameter. The Supabase JS client automatically
  // exchanges it for a session when `detectSessionInUrl` is true (the default).
  // We listen for the PASSWORD_RECOVERY event, which fires once that exchange
  // completes, so we know we have a valid recovery session before accepting input.
  useEffect(() => {
    if (!supabase) {
      // Demo mode — skip session check, allow the form to be filled out
      setSessionReady(true);
      return;
    }

    // Check whether a recovery session is already active (page might have been
    // refreshed after the code was already exchanged).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Give the PASSWORD_RECOVERY event a short window to fire (it arrives
        // slightly after getSession resolves). If nothing arrives, mark the link
        // as invalid so the user sees the error state instead of a broken form.
        setTimeout(() => setSessionReady(prev => prev === null ? false : prev), 2000);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const passwordsMatch = password === confirm;
  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = passwordLongEnough && passwordsMatch && password.length > 0 && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      if (!supabase) {
        // Demo mode — just simulate success
        await new Promise((r) => setTimeout(r, 800));
        setDone(true);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        setDone(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Invalid / expired link ──────────────────────────────────────────────
  if (sessionReady === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-none bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Link expired or invalid</h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            This password reset link has expired or has already been used. Please
            request a new one.
          </p>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-10 text-[10px] font-bold uppercase tracking-widest px-8 shadow-none"
          >
            Request a new link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background flex items-center justify-center px-4">
      <SEO title="Set New Password" description="Set a new password for your ShipOS account." path="/reset-password" noindex />
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
            {done ? 'Password updated' : 'Set a new password'}
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
            {done ? 'You\'re all set' : 'Choose a strong password'}
          </p>
        </div>

        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          <CardContent className="p-6 pt-6">
            {done ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                    You can now sign in with your new password.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none mt-2"
                >
                  Sign in now
                </Button>
              </div>
            ) : (
              /* ── Password form ── */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-muted/30 border-border focus:border-primary focus:ring-primary rounded-none shadow-none"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength hint */}
                  {password.length > 0 && !passwordLongEnough && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                      Must be at least {MIN_PASSWORD_LENGTH} characters
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-muted/30 border-border focus:border-primary focus:ring-primary rounded-none shadow-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Mismatch hint */}
                  {confirm.length > 0 && !passwordsMatch && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-none text-[10px] font-bold uppercase tracking-widest shadow-none"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
