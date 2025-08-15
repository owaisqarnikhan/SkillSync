import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardCards from "@/components/DashboardCards";
import Calendar from "@/components/Calendar";
import TodaySchedule from "@/components/TodaySchedule";
import QuickActions from "@/components/QuickActions";
import RecentNotifications from "@/components/RecentNotifications";
import VenueAvailability from "@/components/VenueAvailability";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setBookingModalOpen(true);
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
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
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Training Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage your team's training sessions and venue bookings</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={() => setBookingModalOpen(true)}
                data-testid="new-booking-request-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Booking Request
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                data-testid="export-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="mb-8">
          <DashboardCards />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar and Booking Section */}
          <div className="lg:col-span-2 space-y-6">
            <Calendar 
              onDateClick={handleDateClick} 
              selectedDate={selectedDate}
            />
            <TodaySchedule />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <RecentNotifications />
            <VenueAvailability />
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
