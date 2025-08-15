import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Venue, TeamWithDetails } from "@shared/schema";
import { format, addDays } from "date-fns";

const bookingSchema = z.object({
  venueId: z.string().min(1, "Please select a venue"),
  teamId: z.string().min(1, "Please select a team"),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select start time"),
  duration: z.enum(["1", "2"], { required_error: "Please select duration" }),
  participantCount: z.coerce.number().min(1, "Must have at least 1 participant").max(50, "Maximum 50 participants"),
  specialRequirements: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedDate?: Date;
  selectedVenueId?: string;
}

export default function BookingModal({ 
  trigger, 
  isOpen, 
  onOpenChange, 
  selectedDate,
  selectedVenueId 
}: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      venueId: selectedVenueId || "",
      teamId: "",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(addDays(new Date(), 1), "yyyy-MM-dd"),
      startTime: "",
      duration: "2",
      participantCount: 1,
      specialRequirements: "",
    },
  });

  // Fetch venues
  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  // Fetch teams
  const { data: teams = [] } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams"],
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(data.duration));

      await apiRequest("POST", "/api/bookings", {
        venueId: data.venueId,
        teamId: data.teamId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        participantCount: data.participantCount,
        specialRequirements: data.specialRequirements || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been submitted and is pending approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
    form.reset();
  };

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  // Update end time when start time or duration changes
  const watchStartTime = form.watch("startTime");
  const watchDuration = form.watch("duration");

  useEffect(() => {
    if (watchStartTime && watchDuration) {
      const [hours, minutes] = watchStartTime.split(":").map(Number);
      const endHours = hours + parseInt(watchDuration);
      const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      // This is just for display, we calculate actual end time in the mutation
    }
  }, [watchStartTime, watchDuration]);

  // Set minimum date to tomorrow
  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const modalOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild data-testid="booking-modal-trigger">
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>New Booking Request</DialogTitle>
          <DialogDescription>
            Select your preferred time slot and provide session details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Venue Selection */}
            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Venue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="venue-select">
                        <SelectValue placeholder="Choose a venue..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id} data-testid={`venue-option-${venue.id}`}>
                          {venue.name} - {venue.type.replace("_", " ")} (Capacity: {venue.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Selection */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="team-select">
                        <SelectValue placeholder="Select your team..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} data-testid={`team-option-${team.id}`}>
                          {team.name} ({team.country.name} - {team.sport.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min={minDate}
                        {...field} 
                        data-testid="date-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="duration-select">
                          <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1" data-testid="duration-option-1">1 Hour</SelectItem>
                        <SelectItem value="2" data-testid="duration-option-2">2 Hours (Maximum)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        data-testid="start-time-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>End Time</FormLabel>
                <Input 
                  type="time" 
                  value={
                    watchStartTime && watchDuration
                      ? (() => {
                          const [hours, minutes] = watchStartTime.split(":").map(Number);
                          const endHours = hours + parseInt(watchDuration);
                          return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                        })()
                      : ""
                  }
                  disabled
                  className="bg-muted"
                  data-testid="end-time-display"
                />
              </div>
            </div>

            {/* Expected Participants */}
            <FormField
              control={form.control}
              name="participantCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Participants</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50" 
                      placeholder="e.g. 12"
                      {...field}
                      data-testid="participant-count-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Requirements */}
            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special equipment or setup requirements..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="special-requirements-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Booking Rules Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Booking Rules:</p>
                  <ul className="text-xs sm:text-sm space-y-1 ml-4 list-disc">
                    <li>Maximum 2 hours per booking session</li>
                    <li>Bookings subject to manager approval</li>
                    <li>48-hour cancellation policy applies</li>
                    <li>Please arrive 15 minutes before scheduled time</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createBookingMutation.isPending}
                data-testid="cancel-booking-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBookingMutation.isPending}
                data-testid="submit-booking-button"
              >
                {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
