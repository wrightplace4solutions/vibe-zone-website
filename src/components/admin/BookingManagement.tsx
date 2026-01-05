import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_type: string;
  service_tier: string;
  status: string;
  deposit_amount: number;
  total_amount: number;
  created_at: string;
  venue_name?: string;
  city?: string;
  state?: string;
  start_time?: string;
  google_calendar_event_id?: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "expired" | "cancelled";

export function BookingManagement() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    booking: Booking | null;
    action: "confirm" | "cancel" | "expire" | null;
  }>({ open: false, booking: null, action: null });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHoursSinceBooking = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  };

  const handleAction = async (action: "confirm" | "cancel" | "expire") => {
    if (!confirmDialog.booking) return;
    
    const booking = confirmDialog.booking;
    setActionLoading(booking.id);
    
    try {
      const newStatus = action === "confirm" ? "confirmed" : action === "expire" ? "expired" : "cancelled";
      
      // Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(action === "confirm" ? { confirmed_at: new Date().toISOString() } : {})
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Sync to Google Calendar if the booking has a calendar event
      if (booking.google_calendar_event_id) {
        try {
          await supabase.functions.invoke("test-calendar-sync", {
            body: { bookingId: booking.id }
          });
        } catch (calendarError) {
          console.error("Calendar sync error:", calendarError);
        }
      }

      toast({
        title: `Booking ${action === "confirm" ? "Confirmed" : action === "expire" ? "Expired" : "Cancelled"}`,
        description: `Booking for ${booking.customer_name} has been ${action === "confirm" ? "confirmed" : action === "expire" ? "marked as expired" : "cancelled"}.`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, booking: null, action: null });
    }
  };

  const openConfirmDialog = (booking: Booking, action: "confirm" | "cancel" | "expire") => {
    setConfirmDialog({ open: true, booking, action });
  };

  const getActionTitle = () => {
    switch (confirmDialog.action) {
      case "confirm": return "Confirm Booking";
      case "cancel": return "Cancel Booking";
      case "expire": return "Mark as Expired";
      default: return "";
    }
  };

  const getActionDescription = () => {
    if (!confirmDialog.booking) return "";
    switch (confirmDialog.action) {
      case "confirm": 
        return `This will mark the booking for ${confirmDialog.booking.customer_name} as confirmed (deposit paid). The calendar event will be updated.`;
      case "cancel": 
        return `This will cancel the booking for ${confirmDialog.booking.customer_name}. The calendar event will be marked as cancelled.`;
      case "expire": 
        return `This will mark the booking for ${confirmDialog.booking.customer_name} as expired (no deposit received within 72 hours). The calendar event will be updated.`;
      default: return "";
    }
  };

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    expired: bookings.filter(b => b.status === "expired").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Management
            </CardTitle>
            <CardDescription>
              View and manage all bookings with status filtering
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="confirmed">Confirmed ({statusCounts.confirmed})</SelectItem>
              <SelectItem value="expired">Expired ({statusCounts.expired})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-yellow-600/80">Pending</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div>
            <div className="text-sm text-green-600/80">Confirmed</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
            <div className="text-sm text-red-600/80">Expired</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</div>
            <div className="text-sm text-gray-600/80">Cancelled</div>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bookings found with the selected filter.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const hoursSince = getHoursSinceBooking(booking.created_at);
                  const isOverdue = booking.status === "pending" && hoursSince > 72;
                  
                  return (
                    <TableRow key={booking.id} className={isOverdue ? "bg-red-50 dark:bg-red-900/10" : ""}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-medium">
                            <User className="h-3 w-3" />
                            {booking.customer_name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {booking.customer_email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {booking.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.event_type}</div>
                          <div className="text-xs text-muted-foreground">{booking.service_tier}</div>
                          {booking.venue_name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {booking.venue_name}
                              {booking.city && `, ${booking.city}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {new Date(booking.event_date).toLocaleDateString()}
                          </div>
                          {booking.start_time && (
                            <div className="text-xs text-muted-foreground">{booking.start_time}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="font-medium">${booking.deposit_amount?.toFixed(2) || "0.00"}</div>
                        <div className="text-xs text-muted-foreground">
                          of ${booking.total_amount?.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                          {hoursSince < 24 
                            ? `${Math.round(hoursSince)}h ago`
                            : `${Math.floor(hoursSince / 24)}d ago`
                          }
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-500">Overdue!</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openConfirmDialog(booking, "confirm")}
                                disabled={actionLoading === booking.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading === booking.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openConfirmDialog(booking, "expire")}
                                disabled={actionLoading === booking.id}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfirmDialog(booking, "cancel")}
                              disabled={actionLoading === booking.id}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, booking: null, action: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getActionTitle()}</DialogTitle>
              <DialogDescription>{getActionDescription()}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog({ open: false, booking: null, action: null })}>
                Cancel
              </Button>
              <Button
                variant={confirmDialog.action === "confirm" ? "default" : "destructive"}
                onClick={() => confirmDialog.action && handleAction(confirmDialog.action)}
                disabled={actionLoading !== null}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {confirmDialog.action === "confirm" ? "Confirm" : confirmDialog.action === "expire" ? "Mark Expired" : "Cancel Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
