import { useState, useEffect } from "react";
import type { User } from "@shared/types";

// Add refresh function to update auth state
let refreshAuthState: (() => void) | null = null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Not authenticated - this is fine, show login page
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Error checking auth - assume not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up global refresh function
    refreshAuthState = checkAuth;
    
    // Clean up on unmount
    return () => {
      refreshAuthState = null;
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
