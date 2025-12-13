import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseStub } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/my-bookings');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/my-bookings');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/my-bookings`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Check your email!',
        description: 'We sent you a magic link to sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-sm sm:max-w-md w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex justify-center mb-3">
              <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14 text-green-500" />
            </div>
            <CardTitle className="text-center text-lg sm:text-xl">Check Your Email</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              We sent a magic link to <strong className="break-all">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                Click the link in the email to access your bookings. The link expires in 1 hour.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full text-sm"
            >
              Try a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show configuration error if Supabase is not set up
  if (isSupabaseStub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-sm sm:max-w-md w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500" />
            </div>
            <CardTitle className="text-center text-lg sm:text-xl">Setup Required</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              The booking system is not fully configured yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100">
                Please contact us directly to manage your bookings or check back later.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="default" className="w-full text-sm">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline" className="w-full text-sm">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-3 sm:p-4">
      <Card className="max-w-sm sm:max-w-md w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-center text-lg sm:text-xl">Access Your Bookings</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLinkLogin} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-sm"
              />
            </div>

            <Button type="submit" className="w-full text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
            <p>No password needed! We'll email you a secure link.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
