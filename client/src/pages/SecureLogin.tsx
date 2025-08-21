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
import type { SystemConfig } from "@shared/types";

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
      setLocation("/");
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Login Form */}
      <div className="bg-white flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="mx-auto w-full max-w-sm animate-fadeInUp">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-6">
              {systemConfig?.logoUrl ? (
                <img 
                  src={systemConfig.logoUrl} 
                  alt="Login Logo" 
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <img 
                  src="/assets/bahrain_logo.png" 
                  alt="Asian Youth Games Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                  }}
                />
              )}
              <div className="text-2xl font-bold text-white hidden">AYG</div>
            </div>
            
            <h1 className="text-lg font-light text-gray-800 mb-1">
              {systemConfig?.systemName || "Asian Youth Games"}
            </h1>
            <h2 className="text-lg font-light text-gray-800 mb-1">
              {systemConfig?.systemSubtitle || "Bahrain 2025"}
            </h2>
            <h3 className="text-lg font-medium text-gray-900 mb-8">
              Training Management System
            </h3>
          </div>

          {/* Sign In Heading */}
          <h4 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Sign In to Your Account
          </h4>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...form.register("username")}
                  data-testid="username-input"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...form.register("password")}
                  data-testid="password-input"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 mt-6"
              disabled={loginMutation.isPending}
              data-testid="login-button"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          {/* Help Text */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Need an account? Contact the IT team of Bahrain Asian Youth Games for access credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Dynamic Blue Background */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Dynamic Blue Background with Animated Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
          {/* Animated wave patterns */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
          </div>
          
          {/* Geometric patterns */}
          <div className="absolute inset-0">
            <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.5 5.16-.76 9-4.95 9-10.5V7l-10-5z"/>
            </svg>
            <svg className="absolute bottom-1/3 left-1/3 w-24 h-24 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          {/* Flowing lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent transform rotate-12"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent transform -rotate-6"></div>
            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform rotate-3"></div>
          </div>
        </div>
        
        {/* Logo in the bottom right */}
        <div className="absolute bottom-8 right-8 animate-slideInRight">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            {systemConfig?.logoUrl ? (
              <img 
                src={systemConfig.logoUrl} 
                alt="Login Logo" 
                className="h-16 w-16 object-contain opacity-90"
              />
            ) : (
              <img 
                src="/assets/bahrain_logo.png" 
                alt="Asian Youth Games Logo" 
                className="h-16 w-16 object-contain opacity-90"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                }}
              />
            )}
            <div className="text-white text-2xl font-bold hidden">AYG</div>
          </div>
          <div className="text-white text-right mt-2">
            <div className="text-sm font-light opacity-90">دورة الألعاب الآسيوية الشبابية</div>
            <div className="text-xs font-light opacity-75">3rd Asian Youth Games</div>
            <div className="text-xs font-light opacity-75">Bahrain 2025 • البحرين</div>
          </div>
        </div>
      </div>
    </div>
  );
}