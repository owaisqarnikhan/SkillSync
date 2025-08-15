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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { BookingWithDetails, VenueWithDetails, TeamWithDetails } from "@shared/schema";
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState<{
    startDateTime: string;
    endDateTime: string;
    participantCount: number;
    specialRequirements: string;
    status?: string;
    denialReason?: string;
  }>({} as any);

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

  const { data: venues = [] } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated,
  });

  const { data: teams = [] } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams"],
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

  const updateBookingMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      apiRequest("PUT", `/api/bookings/${data.id}`, data.updates),
    onSuccess: () => {
      toast({
        title: "Booking Updated",
        description: "Booking has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setEditModalOpen(false);
      setSelectedBooking(null);
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

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => apiRequest("DELETE", `/api/bookings/${bookingId}`),
    onSuccess: () => {
      toast({
        title: "Booking Deleted",
        description: "Booking has been deleted permanently.",
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

  // Handle edit booking
  const handleEditBooking = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setEditFormData({
      startDateTime: format(parseISO(booking.startDateTime), "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(parseISO(booking.endDateTime), "yyyy-MM-dd'T'HH:mm"),
      participantCount: booking.participantCount,
      specialRequirements: booking.specialRequirements || '',
      status: booking.status,
      denialReason: booking.denialReason || '',
    });
    setEditModalOpen(true);
  };

  // Handle delete booking
  const handleDeleteBooking = (bookingId: string) => {
    deleteBookingMutation.mutate(bookingId);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedBooking) return;
    const updates = {
      startDateTime: editFormData.startDateTime,
      endDateTime: editFormData.endDateTime,
      participantCount: editFormData.participantCount,
      specialRequirements: editFormData.specialRequirements,
    };
    
    // Add admin/manager only fields
    if (user?.role !== 'customer') {
      (updates as any).status = editFormData.status;
      if (editFormData.status === 'denied' && editFormData.denialReason) {
        (updates as any).denialReason = editFormData.denialReason;
      }
    }
    
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      updates,
    });
  };

  // Check permissions
  const canEdit = (booking: BookingWithDetails) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'manager') return true;
    if (user?.role === 'customer' && booking.requesterId === user.id && 
        ['requested', 'pending'].includes(booking.status)) return true;
    return false;
  };

  const canDelete = (booking: BookingWithDetails) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'manager') return true;
    return false;
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
                        
                        {(canEdit(booking) || canDelete(booking)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`booking-actions-${booking.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEdit(booking) && (
                                <DropdownMenuItem
                                  onClick={() => handleEditBooking(booking)}
                                  data-testid={`edit-booking-${booking.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Booking
                                </DropdownMenuItem>
                              )}
                              {canDelete(booking) && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="text-destructive"
                                  data-testid={`delete-booking-${booking.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

        {/* Edit Booking Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Make changes to the booking details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {selectedBooking && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedBooking.venue.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.team.name} • {selectedBooking.team.country.name}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDateTime">Start Date & Time</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={editFormData.startDateTime || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, startDateTime: e.target.value })}
                    data-testid="edit-booking-start"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDateTime">End Date & Time</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={editFormData.endDateTime || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, endDateTime: e.target.value })}
                    data-testid="edit-booking-end"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="participantCount">Participant Count</Label>
                <Input
                  id="participantCount"
                  type="number"
                  min="1"
                  value={editFormData.participantCount || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, participantCount: parseInt(e.target.value) || 0 })}
                  data-testid="edit-booking-participants"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  value={editFormData.specialRequirements || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, specialRequirements: e.target.value })}
                  data-testid="edit-booking-requirements"
                />
              </div>
              
              {/* Admin/Manager only fields */}
              {user?.role !== 'customer' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editFormData.status || ''}
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                    >
                      <SelectTrigger data-testid="edit-booking-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editFormData.status === 'denied' && (
                    <div className="grid gap-2">
                      <Label htmlFor="denialReason">Denial Reason</Label>
                      <Textarea
                        id="denialReason"
                        value={editFormData.denialReason || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, denialReason: e.target.value })}
                        data-testid="edit-booking-denial-reason"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                data-testid="cancel-edit-booking"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateBookingMutation.isPending}
                data-testid="save-edit-booking"
              >
                {updateBookingMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
