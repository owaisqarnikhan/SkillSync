import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Filter
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { BookingWithDetails } from "@shared/schema";
import BookingModal from "@/components/BookingModal";

const statusConfig = {
  requested: { label: "Requested", variant: "default" as const, icon: Clock, color: "text-primary" },
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock, color: "text-warning" },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle, color: "text-success" },
  denied: { label: "Denied", variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, icon: AlertCircle, color: "text-gray-500" },
  completed: { label: "Completed", variant: "secondary" as const, icon: CheckCircle, color: "text-gray-600" },
};

export default function Bookings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => 
      apiRequest("PUT", `/api/bookings/${bookingId}`, { status: "cancelled" }),
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    const searchMatch = searchTerm === "" || 
      booking.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.team.name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleCancelBooking = (bookingId: string) => {
    cancelBookingMutation.mutate(bookingId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Bookings</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your training session bookings</p>
            </div>
            <Button 
              onClick={() => setBookingModalOpen(true)}
              data-testid="new-booking-button"
              className="w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4 mr-2" />
              New Booking Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by venue or team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-bookings-input"
                />
              </div>
              <div className="sm:w-44 lg:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="status-filter-select">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? "No bookings found" : "No bookings match your filters"}
              </p>
              <p className="text-muted-foreground mb-6">
                {bookings.length === 0 
                  ? "Create your first booking request to get started."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              <Button onClick={() => setBookingModalOpen(true)}>
                Create New Booking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const config = statusConfig[booking.status];
              const StatusIcon = config.icon;
              const canCancel = ['requested', 'pending', 'approved'].includes(booking.status);

              return (
                <Card key={booking.id} data-testid={`booking-card-${booking.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      {/* Main booking info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate" data-testid={`booking-venue-${booking.id}`}>
                                  {booking.venue.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`booking-team-${booking.id}`}>
                                  {booking.team.name} • {booking.team.country.name}
                                </p>
                              </div>
                            </div>
                            <Badge variant={config.variant} className="flex items-center space-x-1 flex-shrink-0 ml-2">
                              <StatusIcon className="w-3 h-3" />
                              <span className="text-xs">{config.label}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {format(parseISO(booking.startDateTime), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {format(parseISO(booking.startDateTime), "HH:mm")} - {format(parseISO(booking.endDateTime), "HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {booking.participantCount} participants
                            </span>
                          </div>
                        </div>

                        {booking.specialRequirements && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              <strong>Special Requirements:</strong> {booking.specialRequirements}
                            </p>
                          </div>
                        )}

                        {booking.denialReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">
                              <strong>Denial Reason:</strong> {booking.denialReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row gap-2 pt-2 border-t sm:border-t-0 sm:pt-0">
                        {canCancel && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`cancel-booking-${booking.id}`}
                              >
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
        />
      </div>
    </div>
  );
}
