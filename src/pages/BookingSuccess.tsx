import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');

    if (!sessionId || !bookingId) {
      setStatus('error');
      return;
    }

    confirmBooking(sessionId, bookingId);
  }, [searchParams]);

  async function confirmBooking(sessionId: string, bookingId: string) {
    try {
      // Update booking to confirmed
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_session_id: sessionId,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      setBookingDetails(booking);
      setStatus('success');

      // TODO: Add Google Calendar integration here
      // We can call a simple API endpoint to add to calendar
      
    } catch (error) {
      console.error('Error confirming booking:', error);
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
              </div>
              <CardTitle className="text-center">Processing Your Booking...</CardTitle>
              <CardDescription className="text-center">
                Please wait while we confirm your payment
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center text-green-600">Booking Confirmed!</CardTitle>
              <CardDescription className="text-center">
                Your event is now secured
              </CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-center text-red-600">Booking Error</CardTitle>
              <CardDescription className="text-center">
                There was a problem confirming your booking
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === 'success' && bookingDetails && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Booking Details</h3>
                <div className="text-sm space-y-1 text-green-800">
                  <p><strong>Name:</strong> {bookingDetails.customer_name}</p>
                  <p><strong>Email:</strong> {bookingDetails.customer_email}</p>
                  <p><strong>Event Date:</strong> {new Date(bookingDetails.event_date).toLocaleDateString()}</p>
                  <p><strong>Event Type:</strong> {bookingDetails.event_type}</p>
                  {bookingDetails.venue_name && (
                    <p><strong>Venue:</strong> {bookingDetails.venue_name}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>📧 Confirmation email sent!</strong><br />
                  Check your inbox for booking details and next steps.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/')} className="w-full">
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact')} className="w-full">
                  Contact Us
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please contact us if you've been charged but don't see your booking confirmed.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/contact')} className="w-full">
                  Contact Support
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
