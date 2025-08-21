import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings
} from "lucide-react";
import type { BookingWithDetails, VenueWithDetails, TeamWithDetails } from "@shared/types";
import { format, parseISO } from "date-fns";

export default function ManagerDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not Manager/Admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !['manager', 'superadmin'].includes(user?.role || ''))) {
      toast({
        title: "Access Denied",
        description: "Manager access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Fetch pending bookings for approval
  const { data: pendingBookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings", { status: 'pending' }],
    enabled: isAuthenticated && ['manager', 'superadmin'].includes(user?.role || ''),
  });

  // Fetch managed venues
  const { data: venues = [] } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
    enabled: isAuthenticated,
  });

  // Fetch teams
  const { data: teams = [] } = useQuery<TeamWithDetails[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !['manager', 'superadmin'].includes(user?.role || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage bookings, venues, and team operations</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold">{(stats as any)?.pendingRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold">{(stats as any)?.activeBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Managed Venues</p>
                  <p className="text-2xl font-bold">{venues.filter(v => v.managerId === user?.id).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Managed Teams</p>
                  <p className="text-2xl font-bold">{teams.filter(t => t.managerId === user?.id).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="dashboard-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="approvals" data-testid="approvals-tab">
              <Clock className="w-4 h-4 mr-2" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="venues" data-testid="venues-tab">
              <MapPin className="w-4 h-4 mr-2" />
              My Venues
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="teams-tab">
              <Users className="w-4 h-4 mr-2" />
              My Teams
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Management Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Approvals:</span>
                      <span className="font-medium">{pendingBookings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">My Venues:</span>
                      <span className="font-medium">{venues.filter(v => v.managerId === user?.id).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">My Teams:</span>
                      <span className="font-medium">{teams.filter(t => t.managerId === user?.id).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Bookings:</span>
                      <span className="font-medium">{(stats as any)?.activeBookings || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingBookings.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              {pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} need approval
                            </span>
                          </div>
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      Manage your venues, teams, and booking approvals from the tabs above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Booking Requests Requiring Approval</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4" data-testid={`pending-booking-${booking.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{booking.venue.name}</span>
                              <Badge variant="secondary">Pending Review</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>Team:</strong> {booking.team.name} ({booking.team.country.name})
                              </div>
                              <div>
                                <strong>Date:</strong> {format(new Date(booking.startDateTime), "MMM dd, yyyy")}
                              </div>
                              <div>
                                <strong>Time:</strong> {format(new Date(booking.startDateTime), "HH:mm")} - {format(new Date(booking.endDateTime), "HH:mm")}
                              </div>
                            </div>
                            
                            {booking.specialRequirements && (
                              <div className="text-sm">
                                <strong>Special Requirements:</strong> {booking.specialRequirements}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              <XCircle className="w-4 h-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</p>
                    <p className="text-muted-foreground">
                      All booking requests have been processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Venues Tab */}
          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>Venues I Manage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Venue Management</p>
                  <p className="text-muted-foreground">
                    Your managed venues and their booking schedules will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Teams Tab */}
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Teams I Manage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Team Management</p>
                  <p className="text-muted-foreground">
                    Your managed teams and their training schedules will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</p>
                  <p className="text-muted-foreground">
                    Venue utilization, booking trends, and performance metrics will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}