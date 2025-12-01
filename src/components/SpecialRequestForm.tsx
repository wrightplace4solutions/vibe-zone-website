import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquarePlus } from "lucide-react";

interface SpecialRequestFormProps {
  bookingId: string;
  userId: string;
  eventDate: string;
}

export const SpecialRequestForm = ({ bookingId, userId, eventDate }: SpecialRequestFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestType: "",
    description: "",
  });

  // Check if event is more than 14 days away
  const eventDateObj = new Date(eventDate);
  const today = new Date();
  const daysUntilEvent = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const canAddRequest = daysUntilEvent > 14;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddRequest) {
      toast({
        title: "Request Deadline Passed",
        description: "Special requests must be submitted at least 14 days before the event.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert({
          booking_id: bookingId,
          user_id: userId,
          request_type: formData.requestType,
          description: formData.description,
        });

      if (error) throw error;

      toast({
        title: "Request submitted!",
        description: "We'll review your request and get back to you soon.",
      });

      setFormData({ requestType: "", description: "" });
      setOpen(false);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      
      let errorMessage = "Failed to submit request. Please try again.";
      if (error.message?.includes("event_date")) {
        errorMessage = "Special requests must be submitted at least 14 days before the event.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canAddRequest) {
    return (
      <Button variant="outline" size="sm" disabled>
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        Request Deadline Passed
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Add Special Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Special Request</DialogTitle>
          <DialogDescription>
            Submit song requests, equipment needs, or other special requests for your event.
            Must be submitted at least 14 days before your event date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="requestType">Request Type *</Label>
            <Select
              value={formData.requestType}
              onValueChange={(value) =>
                setFormData({ ...formData, requestType: value })
              }
              required
            >
              <SelectTrigger id="requestType">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="song_request">Song Request</SelectItem>
                <SelectItem value="special_equipment">Special Equipment</SelectItem>
                <SelectItem value="timing_change">Timing Change</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your request in detail..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
