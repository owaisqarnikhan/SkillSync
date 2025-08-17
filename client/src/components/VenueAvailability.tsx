import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Waves,
  Footprints,
  CircleDot,
  Activity,
  Car,
  Dumbbell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, startOfDay, endOfDay } from "date-fns";
import type { Venue, BookingWithDetails } from "@shared/types";

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

const venueIconColors = {
  swimming_pool: "text-blue-600",
  athletics_track: "text-orange-600",
  basketball_court: "text-purple-600", 
  volleyball_court: "text-green-600",
  badminton_hall: "text-yellow-600",
  tennis_court: "text-red-600",
  football_field: "text-emerald-600",
  gym: "text-gray-600",
  other: "text-gray-600",
};

export default function VenueAvailability() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  const { data: todayBookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", {
      startDate: format(todayStart, "yyyy-MM-dd"),
      endDate: format(todayEnd, "yyyy-MM-dd"),
    }],
  });

  const getVenueAvailability = (venue: Venue) => {
    const venueBookings = todayBookings.filter(
      booking => booking.venueId === venue.id && 
      ['approved', 'pending', 'requested'].includes(booking.status)
    );

    // Rough calculation - assumes 8 working hours per day with 2-hour slots max
    const maxSlots = 4; // 8 hours / 2 hours per slot
    const occupiedSlots = venueBookings.length;
    const availableSlots = Math.max(0, maxSlots - occupiedSlots);

    if (availableSlots === 0) {
      return { status: 'booked', label: 'Fully booked', slots: 0, variant: 'destructive' as const };
    } else if (availableSlots === 1) {
      return { status: 'limited', label: 'Limited', slots: 1, variant: 'secondary' as const };
    } else {
      return { status: 'available', label: 'Available', slots: availableSlots, variant: 'default' as const };
    }
  };

  const sortedVenues = venues
    .map(venue => ({
      ...venue,
      availability: getVenueAvailability(venue),
    }))
    .sort((a, b) => {
      // Sort by availability status (available first, then limited, then booked)
      const statusOrder: Record<string, number> = { available: 0, limited: 1, booked: 2 };
      return statusOrder[a.availability.status] - statusOrder[b.availability.status];
    })
    .slice(0, 5); // Show top 5 venues

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Availability Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedVenues.map((venue) => {
            const Icon = venueIcons[venue.type] || MapPin;
            const iconColor = venueIconColors[venue.type] || "text-gray-600";
            
            return (
              <div 
                key={venue.id} 
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`venue-availability-${venue.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    venue.availability.status === 'available' ? 'bg-success/10' :
                    venue.availability.status === 'limited' ? 'bg-warning/10' :
                    'bg-destructive/10'
                  }`}>
                    <Icon className={`text-sm ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm" data-testid={`venue-name-${venue.id}`}>
                      {venue.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {venue.availability.slots > 0 
                        ? `${venue.availability.slots} slots available`
                        : 'Fully booked'
                      }
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={venue.availability.variant}
                  className={
                    venue.availability.status === 'available' ? 'bg-success/10 text-success hover:bg-success/20' :
                    venue.availability.status === 'limited' ? 'bg-warning/10 text-warning hover:bg-warning/20' :
                    'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  }
                  data-testid={`venue-status-${venue.id}`}
                >
                  {venue.availability.label}
                </Badge>
              </div>
            );
          })}
        </div>

        <Link href="/venues">
          <Button 
            variant="outline" 
            className="w-full mt-4 border-primary text-primary hover:bg-primary/5"
            data-testid="view-all-venues-button"
          >
            View All Venues
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
