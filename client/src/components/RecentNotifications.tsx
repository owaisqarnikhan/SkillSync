import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Info, 
  XCircle,
  AlertCircle 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { NotificationWithDetails } from "@shared/schema";

const notificationIcons = {
  booking_approved: CheckCircle,
  booking_denied: XCircle,
  booking_cancelled: AlertCircle,
  booking_reminder: Clock,
  booking_requested: Info,
  system_alert: AlertCircle,
};

const notificationColors = {
  booking_approved: "text-success bg-success/10 border-success/20",
  booking_denied: "text-destructive bg-destructive/10 border-destructive/20",
  booking_cancelled: "text-warning bg-warning/10 border-warning/20",
  booking_reminder: "text-blue-600 bg-blue-50 border-blue-200",
  booking_requested: "text-primary bg-primary/10 border-primary/20",
  system_alert: "text-warning bg-warning/10 border-warning/20",
};

export default function RecentNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<NotificationWithDetails[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const recentNotifications = notifications.slice(0, 3);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary/80"
            data-testid="view-all-notifications"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];
              
              return (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 border rounded-lg ${colorClass} ${
                    !notification.isRead ? 'ring-2 ring-primary/20' : ''
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs"
                      data-testid={`mark-read-${notification.id}`}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
