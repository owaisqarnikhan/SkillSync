import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, parseISO } from "date-fns";
import type { BookingWithDetails } from "@shared/types";

const statusConfig = {
  requested: { label: "New Request", variant: "default" as const, bgColor: "border-primary bg-primary/5" },
  pending: { label: "Pending Approval", variant: "secondary" as const, bgColor: "border-warning bg-warning/5" },
  approved: { label: "Confirmed", variant: "default" as const, bgColor: "border-success bg-success/5" },
  denied: { label: "Denied", variant: "destructive" as const, bgColor: "border-destructive bg-destructive/5" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, bgColor: "border-gray-400 bg-gray-50" },
  completed: { label: "Completed", variant: "secondary" as const, bgColor: "border-gray-400 bg-gray-50" },
};

export default function TodaySchedule() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", { 
      startDate: todayStr,
      endDate: todayStr,
    }],
  });

  const todayBookings = bookings.filter(booking => 
    isToday(new Date(booking.startDateTime))
  ).sort((a, b) => 
    new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Today's Schedule - {format(today, "MMMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => {
              const startTime = format(new Date(booking.startDateTime), "HH:mm");
              const endTime = format(new Date(booking.endDateTime), "HH:mm");
              const config = statusConfig[booking.status];

              return (
                <div 
                  key={booking.id} 
                  className={`flex items-center space-x-4 p-4 border rounded-lg ${config.bgColor}`}
                  data-testid={`today-booking-${booking.id}`}
                >
                  <div className={`text-sm font-medium min-w-[80px] ${
                    booking.status === 'approved' ? 'text-success' :
                    booking.status === 'pending' ? 'text-warning' :
                    booking.status === 'denied' ? 'text-destructive' :
                    'text-primary'
                  }`}>
                    {startTime}-{endTime}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground" data-testid={`booking-venue-${booking.id}`}>
                          {booking.venue.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`booking-team-${booking.id}`}>
                          {booking.team.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={config.variant}
                          data-testid={`booking-status-${booking.id}`}
                        >
                          {config.label}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-1 h-auto"
                          data-testid={`booking-info-${booking.id}`}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {booking.specialRequirements && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Special requirements: {booking.specialRequirements}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
