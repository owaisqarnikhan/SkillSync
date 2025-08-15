import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Bell
} from "lucide-react";
import type { BookingWithDetails, VenueWithDetails, TeamWithDetails, NotificationWithDetails } from "@shared/schema";
import { format, parseISO, isAfter } from "date-fns";

export default function UserDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not User/Customer
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['user', 'customer'].includes(user?.role || ''))) {
      toast({
        title: "Access Denied", 
        description: "User access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Fetch user bookings
  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated && ['user', 'customer'].includes(user?.role || ''),
  });

  // Fetch venues
  const { data: venues = [] } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated,
  });

  // Fetch user notifications
  const { data: notifications = [] } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  // Fetch teams for user's country
  const { data: teams = [] } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams", { country: user?.countryCode }],
    enabled: isAuthenticated && !!user?.countryCode,
  });

  // Filter upcoming bookings
  const upcomingBookings = bookings.filter(booking => 
    ['approved', 'pending'].includes(booking.status) && 
    isAfter(new Date(booking.startDateTime), new Date())
  );

  // Filter recent notifications
  const recentNotifications = notifications.filter(n => !n.isRead).slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading User Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !['user', 'customer'].includes(user?.role || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Welcome, {user?.firstName || user?.email}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  NOC Member Dashboard - {user?.countryCode ? `Team ${user.countryCode}` : 'Bahrain Asian Youth Games 2025'}
                </p>
              </div>
            </div>
            
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">My Bookings</p>
                  <p className="text-lg sm:text-2xl font-bold">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Upcoming Sessions</p>
                  <p className="text-lg sm:text-2xl font-bold">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Available Venues</p>
                  <p className="text-lg sm:text-2xl font-bold">{venues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Notifications</p>
                  <p className="text-lg sm:text-2xl font-bold">{recentNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" data-testid="overview-tab" className="text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="my-bookings-tab" className="text-xs sm:text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="venues" data-testid="browse-venues-tab" className="text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Browse Venues</span>
              <span className="sm:hidden">Venues</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="notifications-tab" className="text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Upcoming Training Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-3" data-testid={`upcoming-booking-${booking.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{booking.venue.name}</h4>
                            <Badge variant={booking.status === 'approved' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{format(new Date(booking.startDateTime), "MMM dd, yyyy")}</div>
                            <div>{format(new Date(booking.startDateTime), "HH:mm")} - {format(new Date(booking.endDateTime), "HH:mm")}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Recent Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {recentNotifications.map((notification) => (
                        <div key={notification.id} className="border-l-4 border-blue-400 pl-3 py-2" data-testid={`notification-${notification.id}`}>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No new notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2" data-testid="quick-book-venue">
                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Book Venue</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2" data-testid="quick-view-bookings">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">View Bookings</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2" data-testid="quick-browse-venues">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Browse Venues</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2" data-testid="quick-view-teams">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">View Teams</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Training Session Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4" data-testid={`booking-${booking.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{booking.venue.name}</h4>
                              <Badge 
                                variant={
                                  booking.status === 'approved' ? 'default' : 
                                  booking.status === 'denied' ? 'destructive' : 
                                  'secondary'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Date: {format(new Date(booking.startDateTime), "MMM dd, yyyy")}</div>
                              <div>Time: {format(new Date(booking.startDateTime), "HH:mm")} - {format(new Date(booking.endDateTime), "HH:mm")}</div>
                              <div>Participants: {booking.participantCount}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(booking.createdAt), "MMM dd")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</p>
                    <p className="text-muted-foreground mb-6">
                      Start by booking a training venue for your team.
                    </p>
                    <Button data-testid="book-first-venue">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Your First Venue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Venues Tab */}
          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>Available Training Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Venue Browser</p>
                  <p className="text-muted-foreground mb-6">
                    Browse and book training venues will be available here.
                  </p>
                  <Button data-testid="browse-all-venues">
                    <MapPin className="w-4 h-4 mr-2" />
                    Browse All Venues
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`border rounded-lg p-3 ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Notifications</p>
                    <p className="text-muted-foreground">
                      You'll receive notifications about your bookings and system updates here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}