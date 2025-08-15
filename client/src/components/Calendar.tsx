import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { BookingWithDetails } from "@shared/schema";

interface CalendarProps {
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

const statusColors = {
  requested: "bg-primary",
  pending: "bg-warning",
  approved: "bg-success",
  denied: "bg-destructive",
  cancelled: "bg-gray-400",
  completed: "bg-gray-600",
};

const statusLabels = {
  requested: "Requested",
  pending: "Pending",
  approved: "Approved", 
  denied: "Denied",
  cancelled: "Cancelled",
  completed: "Completed",
};

export default function Calendar({ onDateClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Fetch bookings for the current month
  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", {
      startDate: monthStart.toISOString().split('T')[0],
      endDate: monthEnd.toISOString().split('T')[0],
    }],
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.startDateTime), date)
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => 
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Training Calendar</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(currentMonth, "MMMM yyyy")}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              data-testid="calendar-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                data-testid="calendar-view-day"
              >
                Day
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                data-testid="calendar-view-week"
              >
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                data-testid="calendar-view-month"
              >
                Month
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              data-testid="calendar-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground text-center py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`
                  aspect-square flex flex-col items-center justify-start p-1 text-sm cursor-pointer rounded-md transition-colors relative
                  ${isCurrentMonth 
                    ? "text-gray-900 hover:bg-gray-50" 
                    : "text-gray-400 hover:bg-gray-50"
                  }
                  ${isSelected ? "bg-primary/10 border-2 border-primary" : ""}
                  ${isToday && !isSelected ? "bg-blue-50 font-semibold" : ""}
                `}
                onClick={() => handleDateClick(day)}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <span className={isToday && !isSelected ? "text-primary font-semibold" : ""}>
                  {format(day, "d")}
                </span>
                
                {/* Booking indicators */}
                {dayBookings.length > 0 && (
                  <div className="absolute bottom-1 flex space-x-0.5">
                    {dayBookings.slice(0, 3).map((booking, i) => (
                      <div
                        key={booking.id}
                        className={`w-1 h-1 rounded-full ${statusColors[booking.status]}`}
                        title={`${booking.venue.name} - ${statusLabels[booking.status]}`}
                        data-testid={`booking-indicator-${booking.id}`}
                      />
                    ))}
                    {dayBookings.length > 3 && (
                      <div 
                        className="w-1 h-1 rounded-full bg-gray-400"
                        title={`+${dayBookings.length - 3} more bookings`}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span className="text-muted-foreground">Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-muted-foreground">Requested</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-full" />
            <span className="text-muted-foreground">Denied</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
