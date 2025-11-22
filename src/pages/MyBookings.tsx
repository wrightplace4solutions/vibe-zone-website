import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, Mail, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Booking {
  id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  package_type: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserEmail(session.user.email || '');
      await fetchBookings(session.user.email || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to check authentication',
        variant: 'destructive',
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (email: string) => {
    try {
      const response = await supabase
        .from('bookings')
        .select('id, event_date, start_time, end_time, package_type, email, phone, status, created_at')
        .eq('email', email)
        .order('event_date', { ascending: false });

      if (response.error) throw response.error;

      setBookings((response.data as unknown as Booking[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
            <p className="text-purple-200 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {userEmail}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Bookings Found</CardTitle>
              <CardDescription>
                You don't have any bookings yet. Ready to book a service?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/booking')}>
                Book Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">
                        {booking.package_type.replace(/-/g, ' ')}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.event_date), 'MMMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {booking.start_time} - {booking.end_time}
                    </div>
                    <div className="text-muted-foreground">
                      Phone: {booking.phone}
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
