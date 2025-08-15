import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Users, MapPin, Shield, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/10">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Training Management System</h1>
                <p className="text-sm text-gray-500">Bahrain Asian Youth Games 2025</p>
              </div>
            </div>
            <Button onClick={handleLogin} data-testid="login-button">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to the
              <span className="block text-primary">Training Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your team's training sessions with our comprehensive venue booking platform 
              for the Bahrain Asian Youth Games 2025. Efficient, secure, and designed for excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="hero-login-button">
                Get Started
              </Button>
              <Button variant="outline" size="lg" data-testid="learn-more-button">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Training Sessions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools necessary for efficient venue booking and team management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced calendar system with conflict detection and automated approval workflows 
                  to ensure smooth booking processes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Venue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive venue database with availability tracking, capacity management, 
                  and real-time status updates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Team Coordination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize teams by country and sport, manage member counts, and coordinate 
                  training schedules across multiple disciplines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Secure access control with SuperAdmin, Manager, and Customer roles, 
                  each with appropriate permissions and capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Multi-Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Available in English and Arabic to accommodate all participating nations 
                  in the Asian Youth Games.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Instant notifications for booking confirmations, changes, and reminders 
                  to keep everyone informed and prepared.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Your Training Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join teams from across Asia in using our comprehensive training management platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleLogin}
            data-testid="cta-login-button"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="text-primary-foreground text-sm" />
              </div>
              <div>
                <p className="font-medium">Training Management System</p>
                <p className="text-sm text-gray-400">Bahrain Asian Youth Games 2025</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Bahrain Asian Youth Games. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
