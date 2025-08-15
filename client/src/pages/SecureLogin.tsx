import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { User, Lock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SystemConfig } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SecureLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch system configuration for customizable login text
  const { data: systemConfig } = useQuery<SystemConfig>({
    queryKey: ["/api/system/config"],
    retry: false,
  });

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const [loginError, setLoginError] = useState("");
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      // Force a page reload to refresh authentication state
      window.location.reload();
    },
    onError: (error: Error) => {
      setLoginError(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginForm) => {
    setLoginError("");
    loginMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-6xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              {/* Left Panel - Login Form */}
              <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                <div className="space-y-6">
                  {/* Logo Section */}
                  <div className="text-center lg:text-left">
                    {systemConfig?.logoUrl && (
                      <img 
                        src={systemConfig.logoUrl} 
                        alt="Logo" 
                        className="h-16 w-auto mx-auto lg:mx-0 mb-6"
                      />
                    )}
                  </div>

                  {/* Configurable Headlines */}
                  <div className="space-y-2 text-center lg:text-left">
                    <h1 
                      className="text-2xl font-light text-gray-600"
                      data-testid="login-heading-1"
                    >
                      {systemConfig?.loginHeading1 || "Welcome to"}
                    </h1>
                    <h1 
                      className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                      data-testid="login-heading-2"
                    >
                      {systemConfig?.loginHeading2 || "Bahrain Asian Youth Games 2025"}
                    </h1>
                    <h2 
                      className="text-xl font-medium text-blue-600"
                      data-testid="login-heading-3"
                    >
                      {systemConfig?.loginHeading3 || "Training Management System"}
                    </h2>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            className="pl-10"
                            {...form.register("username")}
                            data-testid="username-input"
                          />
                        </div>
                        {form.formState.errors.username && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            {...form.register("password")}
                            data-testid="password-input"
                          />
                        </div>
                        {form.formState.errors.password && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={loginMutation.isPending}
                      data-testid="login-button"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-semibold text-lg">1</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Secure Login</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-semibold text-lg">2</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Book Venues</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-600 font-semibold text-lg">3</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Manage Training</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-6">
                    By logging in, you agree to the terms of service and privacy policy
                  </p>
                </div>
              </div>

              {/* Right Panel - Separator Image */}
              <div 
                className="hidden lg:block bg-cover bg-center bg-no-repeat relative"
                style={{
                  backgroundImage: systemConfig?.separatorImageUrl 
                    ? `url(${systemConfig.separatorImageUrl})` 
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                }}
              >
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                
                {/* Content overlay */}
                <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7H7a1 1 0 100 2h6a1 1 0 100-2zm-6 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Streamlined Management</h3>
                    <p className="text-lg opacity-90">
                      Advanced booking system designed specifically for the Bahrain Asian Youth Games 2025
                    </p>
                    <div className="flex space-x-8 justify-center pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-sm opacity-75">Venues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">30+</div>
                        <div className="text-sm opacity-75">Countries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">24/7</div>
                        <div className="text-sm opacity-75">Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}