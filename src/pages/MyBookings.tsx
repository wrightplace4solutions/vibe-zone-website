import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Calendar,
  MapPin,
  LogOut,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
  Edit,
  CheckCircle,
  AlertCircle,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpecialRequestForm } from '@/components/SpecialRequestForm';
import { PACKAGES } from '@/config/booking';

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
  customer_phone: string;
  customer_email: string;
  notes?: string;
  user_id?: string;
  total_amount: number;
  deposit_amount?: number;
  package_type?: string;
  stripe_payment_intent?: string;
  confirmed_at?: string;
}

export default function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    venue_name: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    customer_name: '',
    customer_phone: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [payingDeposit, setPayingDeposit] = useState<string | null>(null);
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

  // Calculate hours until event
  const getHoursUntilEvent = (eventDate: string): number => {
    const event = new Date(eventDate);
    const now = new Date();
    const diffMs = event.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  // Calculate hours since booking was created
  const getHoursSinceBooking = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  // Check if user can still pay deposit (72 hours from booking creation)
  const canPayDeposit = (booking: Booking): boolean => {
    if (booking.status === 'confirmed' || booking.status === 'cancelled' || booking.status === 'expired') return false;
    const hoursSinceBooking = getHoursSinceBooking(booking.created_at);
    return hoursSinceBooking <= 72;
  };

  // Check if user can edit (72 hours before event)
  const canEdit = (booking: Booking): boolean => {
    if (booking.status === 'cancelled' || booking.status === 'expired') return false;
    const hoursUntilEvent = getHoursUntilEvent(booking.event_date);
    return hoursUntilEvent >= 72;
  };

  // Get status action message for user
  const getStatusActionMessage = (booking: Booking): { message: string; type: 'success' | 'warning' | 'error' | 'info' } => {
    switch (booking.status) {
      case 'confirmed':
        return { message: '✓ Confirmed by appointment - Deposit received', type: 'success' };
      case 'pending':
        const hoursSince = getHoursSinceBooking(booking.created_at);
        if (hoursSince > 72) {
          return { message: 'Deposit hold expired - Date may no longer be available', type: 'error' };
        }
        return { message: 'Action Required: Pay deposit to confirm booking', type: 'warning' };
      case 'expired':
        return { message: 'Booking cancelled - No deposit received within 72 hours', type: 'error' };
      case 'cancelled':
        return { message: 'Booking cancelled', type: 'error' };
      default:
        return { message: 'No action required', type: 'info' };
    }
  };

  // Get time remaining for deposit
  const getDepositTimeRemaining = (createdAt: string): string => {
    const hoursSince = getHoursSinceBooking(createdAt);
    const hoursRemaining = 72 - hoursSince;
    if (hoursRemaining <= 0) return 'Expired';
    if (hoursRemaining < 1) return `${Math.round(hoursRemaining * 60)} minutes`;
    if (hoursRemaining < 24) return `${Math.round(hoursRemaining)} hours`;
    return `${Math.floor(hoursRemaining / 24)} days, ${Math.round(hoursRemaining % 24)} hours`;
  };

  // Get time remaining for edits
  const getEditTimeRemaining = (eventDate: string): string => {
    const hoursUntil = getHoursUntilEvent(eventDate);
    const editableHours = hoursUntil - 72;
    if (editableHours <= 0) return 'Locked';
    if (editableHours < 1) return `${Math.round(editableHours * 60)} minutes`;
    if (editableHours < 24) return `${Math.round(editableHours)} hours`;
    return `${Math.floor(editableHours / 24)} days`;
  };

  const handlePayDeposit = async (booking: Booking) => {
    setPayingDeposit(booking.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          bookingId: booking.id,
          packageType: booking.package_type || 'essentialVibe',
          customerEmail: booking.customer_email,
          customerName: booking.customer_name,
          customerPhone: booking.customer_phone,
          eventDate: booking.event_date,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: 'Error creating payment session',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPayingDeposit(null);
    }
  };

  const openEditDialog = (booking: Booking) => {
    setEditingBooking(booking);
    setEditForm({
      venue_name: booking.venue_name || '',
      street_address: booking.street_address || '',
      city: booking.city || '',
      state: booking.state || '',
      zip_code: booking.zip_code || '',
      customer_name: booking.customer_name || '',
      customer_phone: booking.customer_phone || '',
      notes: booking.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          venue_name: editForm.venue_name || null,
          street_address: editForm.street_address || null,
          city: editForm.city || null,
          state: editForm.state || null,
          zip_code: editForm.zip_code || null,
          customer_name: editForm.customer_name,
          customer_phone: editForm.customer_phone,
          notes: editForm.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      toast({
        title: 'Booking updated',
        description: 'Your changes have been saved successfully.',
      });

      // Reload bookings
      await loadBookings(userEmail);
      setEditDialogOpen(false);
      setEditingBooking(null);
    } catch (error: any) {
      toast({
        title: 'Error saving changes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending Payment</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPackageInfo = (serviceTier: string) => {
    const packageKey = Object.keys(PACKAGES).find(
      key => PACKAGES[key as keyof typeof PACKAGES].name === serviceTier
    );
    if (packageKey) {
      return PACKAGES[packageKey as keyof typeof PACKAGES];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-3 sm:p-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Bookings</h1>
            <p className="text-purple-200 text-sm sm:text-base truncate">{userEmail}</p>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Sign Out
            </Button>
          </div>
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
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isExpanded = expandedBooking === booking.id;
              const canPayDep = canPayDeposit(booking);
              const canEditBooking = canEdit(booking);
              const packageInfo = getPackageInfo(booking.service_tier);
              const statusAction = getStatusActionMessage(booking);

              return (
                <Card key={booking.id} className="overflow-hidden">
                  {/* Compact Header - Always Visible */}
                  <CardHeader 
                    className="pb-2 sm:pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base sm:text-lg">{booking.event_type}</CardTitle>
                          {getStatusBadge(booking.status)}
                        </div>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.event_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {booking.start_time && ` at ${booking.start_time}`}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && canPayDep && (
                          <Badge variant="destructive" className="text-xs">
                            Pay within {getDepositTimeRemaining(booking.created_at)}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      <Separator />

                      {/* Status Action Message */}
                      <div className={`rounded-lg p-3 sm:p-4 ${
                        statusAction.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                        statusAction.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                        statusAction.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                        'bg-muted/30 border border-border'
                      }`}>
                        <p className={`text-sm font-medium ${
                          statusAction.type === 'success' ? 'text-green-700 dark:text-green-300' :
                          statusAction.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                          statusAction.type === 'error' ? 'text-red-700 dark:text-red-300' :
                          'text-foreground'
                        }`}>
                          {statusAction.message}
                        </p>
                        {(booking.status === 'expired' || booking.status === 'cancelled') && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-2 text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/booking');
                            }}
                          >
                            Check availability for a new booking →
                          </Button>
                        )}
                      </div>
                      {/* Package Details */}
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Package Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Package:</span>{' '}
                            <span className="font-medium">{booking.service_tier}</span>
                          </div>
                          {booking.start_time && booking.end_time && (
                            <div>
                              <span className="text-muted-foreground">Time:</span>{' '}
                              <span className="font-medium">{booking.start_time} - {booking.end_time}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Total:</span>{' '}
                            <span className="font-medium">${booking.total_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deposit:</span>{' '}
                            <span className="font-medium">${booking.deposit_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        {packageInfo && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Includes:</span> {packageInfo.includes.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Location Details */}
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Event Location
                        </h4>
                        <div className="text-sm space-y-1">
                          {booking.venue_name && (
                            <div className="font-medium">{booking.venue_name}</div>
                          )}
                          {booking.street_address ? (
                            <div className="text-muted-foreground">
                              {booking.street_address}
                              {booking.city && `, ${booking.city}`}
                              {booking.state && `, ${booking.state}`}
                              {booking.zip_code && ` ${booking.zip_code}`}
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">No address provided</div>
                          )}
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.customer_email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <h4 className="font-semibold text-sm sm:text-base mb-2">Special Notes</h4>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}

                      {/* Payment Status & Actions */}
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Status
                        </h4>
                        
                        {booking.status === 'confirmed' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Deposit Paid</span>
                            {booking.confirmed_at && (
                              <span className="text-xs text-muted-foreground">
                                on {new Date(booking.confirmed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : booking.status === 'pending' ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-yellow-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">Awaiting Deposit Payment</span>
                            </div>
                            {canPayDep ? (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  Pay your deposit of <strong>${booking.deposit_amount?.toFixed(2) || '250.00'}</strong> within{' '}
                                  <strong>{getDepositTimeRemaining(booking.created_at)}</strong> to confirm your booking.
                                </p>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayDeposit(booking);
                                  }}
                                  disabled={payingDeposit === booking.id}
                                  className="w-full sm:w-auto"
                                  size="sm"
                                >
                                  {payingDeposit === booking.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="mr-2 h-3 w-3" />
                                      Pay Deposit Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="text-xs text-red-500">
                                <AlertCircle className="inline h-3 w-3 mr-1" />
                                The 72-hour payment window has expired. Please contact us to reschedule.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Booking Cancelled</span>
                          </div>
                        )}
                      </div>

                      {/* Edit Section */}
                      {booking.status !== 'cancelled' && (
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Make Changes
                          </h4>
                          {canEditBooking ? (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                You can edit your booking details until{' '}
                                <strong>{getEditTimeRemaining(booking.event_date)}</strong> before your event.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(booking);
                                }}
                              >
                                <Edit className="mr-2 h-3 w-3" />
                                Edit Booking Details
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              <AlertCircle className="inline h-3 w-3 mr-1" />
                              Booking details are locked. Changes can only be made up to 72 hours before the event.
                              Please <Link to="/contact" className="text-primary underline">contact us</Link> for any urgent changes.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special Request Button */}
                      {booking.user_id && booking.status !== 'cancelled' && (
                        <div className="pt-2">
                          <SpecialRequestForm 
                            bookingId={booking.id} 
                            userId={booking.user_id}
                            eventDate={booking.event_date}
                          />
                        </div>
                      )}

                      {/* Footer */}
                      <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
                        <span>Booking ID: {booking.id.slice(0, 8)}...</span>
                        <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="pt-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Need help with your booking?</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/contact">Contact Us</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/refunds">Refund Policy</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/booking">Book Another Event</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update your event location and contact details. Changes must be made at least 72 hours before your event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="customer_name">Contact Name</Label>
              <Input
                id="customer_name"
                value={editForm.customer_name}
                onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input
                id="customer_phone"
                value={editForm.customer_phone}
                onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
              />
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue Name</Label>
              <Input
                id="venue_name"
                value={editForm.venue_name}
                onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
                placeholder="e.g., Community Center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                value={editForm.street_address}
                onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={editForm.zip_code}
                onChange={(e) => setEditForm({ ...editForm, zip_code: e.target.value })}
                className="w-32"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes / Requests</Label>
              <Input
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
