import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Users,
  ChevronRight 
} from "lucide-react";
import { Link } from "wouter";
import BookingModal from "@/components/BookingModal";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <BookingModal
          trigger={
            <Button 
              variant="outline" 
              className="w-full justify-between p-3 h-auto hover:border-primary hover:bg-primary/5"
              data-testid="quick-action-new-booking"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-5 w-5 text-primary" />
                <span className="font-medium">Request New Booking</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          }
        />
        
        <Link href="/venues">
          <Button 
            variant="outline" 
            className="w-full justify-between p-3 h-auto hover:border-primary hover:bg-primary/5"
            data-testid="quick-action-browse-venues"
          >
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5 text-primary" />
              <span className="font-medium">Browse Venues</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        
        <Link href="/teams">
          <Button 
            variant="outline" 
            className="w-full justify-between p-3 h-auto hover:border-primary hover:bg-primary/5"
            data-testid="quick-action-manage-teams"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Teams</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
