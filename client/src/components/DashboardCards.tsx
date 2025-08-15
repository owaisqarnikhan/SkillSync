import { Card, CardContent } from "@/components/ui/card";
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Users 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  activeBookings: number;
  pendingRequests: number;
  availableVenues: number;
  teamMembers: number;
}

export default function DashboardCards() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const cards = [
    {
      title: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: CalendarCheck,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "active-bookings-card"
    },
    {
      title: "Pending Requests", 
      value: stats?.pendingRequests || 0,
      icon: Clock,
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
      testId: "pending-requests-card"
    },
    {
      title: "Available Venues",
      value: stats?.availableVenues || 0,
      icon: MapPin,
      bgColor: "bg-success/10", 
      iconColor: "text-success",
      testId: "available-venues-card"
    },
    {
      title: "Team Members",
      value: stats?.teamMembers || 0,
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "team-members-card"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="border border-gray-200" data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={`${card.testId}-value`}>
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
