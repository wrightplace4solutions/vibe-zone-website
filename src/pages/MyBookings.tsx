import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, MapPin, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpecialRequestForm } from '@/components/SpecialRequestForm';

interface Booking {
  id: string;
  event_date: string;
  event_type: string;
  service_tier: string;
  venue_name?: string;
  start_time?: string;
  end_time?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status: string;
  created_at: string;
  customer_name: string;
  notes?: string;
  user_id?: string;
}

export default function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setUserEmail(session.user.email || '');
    loadBookings(session.user.email || '');
  };

  const loadBookings = async (email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_email', email)
        .order('event_date', { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading bookings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-3 sm:p-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Bookings</h1>
            <p className="text-purple-200 text-sm sm:text-base truncate">{userEmail}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="self-start sm:self-center">
            <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Sign Out
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">No Bookings Yet</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                You haven't made any bookings. Ready to book an event?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/booking')} size="sm" className="text-sm">
                Create Your First Booking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{booking.event_type}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{booking.service_tier}</CardDescription>
                    </div>
                    <span
                      className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold self-start ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      {new Date(booking.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {booking.start_time && booking.end_time && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ⏰ {booking.start_time} - {booking.end_time}
                    </div>
                  )}

                  {(booking.venue_name || booking.street_address) && (
                    <div className="flex items-start text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        {booking.venue_name && <div>{booking.venue_name}</div>}
                        {booking.street_address && (
                          <div className="break-words">
                            {booking.street_address}
                            {booking.city && `, ${booking.city}`}
                            {booking.state && `, ${booking.state}`}
                            {booking.zip_code && ` ${booking.zip_code}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm">
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}

                  {/* Special Request Button */}
                  {booking.user_id && booking.status !== 'cancelled' && (
                    <div className="pt-1 sm:pt-2">
                      <SpecialRequestForm 
                        bookingId={booking.id} 
                        userId={booking.user_id}
                        eventDate={booking.event_date}
                      />
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-1 sm:pt-2 border-t">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
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
