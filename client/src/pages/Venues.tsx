import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
  MapPin,
  Users,
  Clock,
  Waves,
  Footprints,
  CircleDot,
  Activity,
  Dumbbell,
  Calendar
} from "lucide-react";
import type { VenueWithDetails, BookingWithDetails } from "@shared/schema";
import BookingModal from "@/components/BookingModal";
import { format, startOfDay, endOfDay } from "date-fns";

const venueIcons = {
  swimming_pool: Waves,
  athletics_track: Footprints,
  basketball_court: CircleDot,
  volleyball_court: Activity,
  badminton_hall: Activity,
  tennis_court: CircleDot,
  football_field: CircleDot,
  gym: Dumbbell,
  other: MapPin,
};

const venueTypeLabels = {
  swimming_pool: "Swimming Pool",
  athletics_track: "Athletics Track",
  basketball_court: "Basketball Court",
  volleyball_court: "Volleyball Court",
  badminton_hall: "Badminton Hall",
  tennis_court: "Tennis Court",
  football_field: "Football Field",
  gym: "Gymnasium",
  other: "Other",
};

export default function Venues() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string>();

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

  const { data: venues = [], isLoading: venuesLoading } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated,
  });

  const today = new Date();
  const { data: todayBookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", {
      startDate: format(startOfDay(today), "yyyy-MM-dd"),
      endDate: format(endOfDay(today), "yyyy-MM-dd"),
    }],
    enabled: isAuthenticated,
  });

  const getVenueAvailability = (venue: VenueWithDetails) => {
    const venueBookings = todayBookings.filter(
      booking => booking.venueId === venue.id && 
      ['approved', 'pending', 'requested'].includes(booking.status)
    );

    // Calculate rough availability based on working hours and bookings
    const workingStart = venue.workingStartTime || "06:00";
    const workingEnd = venue.workingEndTime || "22:00";
    const [startHour] = workingStart.split(':').map(Number);
    const [endHour] = workingEnd.split(':').map(Number);
    const totalHours = endHour - startHour;
    const maxSlots = Math.floor(totalHours / 2); // Assuming 2-hour slots
    
    const occupiedSlots = venueBookings.length;
    const availableSlots = Math.max(0, maxSlots - occupiedSlots);

    if (availableSlots === 0) {
      return { status: 'booked', label: 'Fully Booked', color: 'destructive' };
    } else if (availableSlots <= 2) {
      return { status: 'limited', label: 'Limited', color: 'secondary' };
    } else {
      return { status: 'available', label: 'Available', color: 'default' };
    }
  };

  // Filter venues based on type and search term
  const filteredVenues = venues.filter(venue => {
    const typeMatch = typeFilter === "all" || venue.type === typeFilter;
    const searchMatch = searchTerm === "" || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const handleBookVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    setBookingModalOpen(true);
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Venues</h2>
          <p className="text-gray-600 mt-1">Browse and book training venues for your team</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search venues by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-venues-input"
                />
              </div>
              <div className="sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="type-filter-select">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="swimming_pool">Swimming Pool</SelectItem>
                    <SelectItem value="athletics_track">Athletics Track</SelectItem>
                    <SelectItem value="basketball_court">Basketball Court</SelectItem>
                    <SelectItem value="volleyball_court">Volleyball Court</SelectItem>
                    <SelectItem value="badminton_hall">Badminton Hall</SelectItem>
                    <SelectItem value="tennis_court">Tennis Court</SelectItem>
                    <SelectItem value="football_field">Football Field</SelectItem>
                    <SelectItem value="gym">Gymnasium</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        {venuesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading venues...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {venues.length === 0 ? "No venues available" : "No venues match your filters"}
              </p>
              <p className="text-muted-foreground">
                {venues.length === 0 
                  ? "Please contact your administrator to add venues."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => {
              const Icon = venueIcons[venue.type] || MapPin;
              const availability = getVenueAvailability(venue);

              return (
                <Card key={venue.id} className="hover:shadow-lg transition-shadow" data-testid={`venue-card-${venue.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`venue-name-${venue.id}`}>
                            {venue.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {venueTypeLabels[venue.type]}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={availability.color as any}
                        className={
                          availability.status === 'available' ? 'bg-success/10 text-success hover:bg-success/20' :
                          availability.status === 'limited' ? 'bg-warning/10 text-warning hover:bg-warning/20' :
                          'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        }
                      >
                        {availability.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Venue details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Capacity: {venue.capacity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {venue.workingStartTime || "06:00"} - {venue.workingEndTime || "22:00"}
                          </span>
                        </div>
                      </div>

                      {venue.location && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{venue.location}</span>
                        </div>
                      )}

                      {venue.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {venue.description}
                        </p>
                      )}

                      {venue.amenities && venue.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {venue.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {venue.amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{venue.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <Button 
                          className="w-full" 
                          onClick={() => handleBookVenue(venue.id)}
                          disabled={availability.status === 'booked'}
                          data-testid={`book-venue-${venue.id}`}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {availability.status === 'booked' ? 'Fully Booked' : 'Book Now'}
                        </Button>
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
          selectedVenueId={selectedVenueId}
        />
      </div>
    </div>
  );
}
