import React from "react";
import api from "./api";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  token?: string;
  requireOTP?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface PendingApplication {
  files?: Record<string, File>;
  loanAmount?: number;
  repaymentPeriod?: number;
  formData?: Record<string, any>;
  timestamp?: number;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  /**
   * Get current user from localStorage
   */
  public getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save form data temporarily and redirect to authentication
   */
  public saveFormDataAndRedirect(
    formData: Record<string, any>,
    redirectTo: string = "/apply",
    navigate: (path: string) => void,
  ): void {
    // Save the current form data
    const pendingApp: PendingApplication = {
      formData,
      timestamp: Date.now(),
      ...formData,
    };

    localStorage.setItem("pendingApplication", JSON.stringify(pendingApp));
    localStorage.setItem("redirectAfterLogin", redirectTo);

    // Navigate to registration (preferred) or login
    navigate("/register");
  }

  /**
   * Handle form submission with authentication check
   */
  public async handleFormSubmission(
    formData: Record<string, any>,
    submitCallback: (data: Record<string, any>) => Promise<any>,
    navigate: (path: string) => void,
    redirectTo: string = "/apply",
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if user is authenticated
      if (!this.isAuthenticated()) {
        this.saveFormDataAndRedirect(formData, redirectTo, navigate);
        return {
          success: false,
          message:
            "Please create an account or log in to continue with your application.",
        };
      }

      // User is authenticated, proceed with form submission
      const result = await submitCallback(formData);
      return {
        success: true,
        message: "Form submitted successfully",
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Form submission failed",
      };
    }
  }

  /**
   * Request OTP for Phone Login
   */
  public async requestPhoneOTP(phone: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.post("/auth/request-phone-otp", { phone });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP. Is your phone number registered?"
      };
    }
  }

  /**
   * Login user and handle redirect
   */
  public async login(
    email: string,
    password: string,
    navigate: (path: string) => void,
  ): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const userData = response.data.data;

        // Only store if token is present (not waiting for OTP)
        if (userData.token) {
          localStorage.setItem("token", userData.token);
          localStorage.setItem("user", JSON.stringify(userData));
          this.handlePostAuthRedirect(navigate);
        }

        return {
          success: true,
          message: response.data.message || "Request processed",
          data: userData,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  }

  /**
   * Register new user and handle redirect
   */
  public async register(
    userData: {
      fullName: string;
      email: string;
      phone?: string;
      password: string;
    },
    navigate: (path: string) => void,
  ): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        const user = response.data.data;

        // Only store if token is present
        if (user.token) {
          localStorage.setItem("token", user.token);
          localStorage.setItem("user", JSON.stringify(user));
          this.handlePostAuthRedirect(navigate);
        }

        return {
          success: true,
          message: response.data.message || "Account created successfully",
          data: user,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Handle redirect after successful authentication
   */
  private handlePostAuthRedirect(navigate: (path: string) => void): void {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    localStorage.removeItem("redirectAfterLogin");
    // Always go to dashboard; the apply modal is inside the dashboard
    navigate(redirectPath && redirectPath !== "/apply" ? redirectPath : "/dashboard");
  }

  /**
   * Get pending application data
   */
  public getPendingApplication(): PendingApplication | null {
    try {
      const pendingStr = localStorage.getItem("pendingApplication");
      return pendingStr ? JSON.parse(pendingStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear pending application data
   */
  public clearPendingApplication(): void {
    localStorage.removeItem("pendingApplication");
    localStorage.removeItem("redirectAfterLogin");
  }

  /**
   * Logout user and clear all data
   */
  public logout(navigate: (path: string) => void): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingApplication");
    localStorage.removeItem("redirectAfterLogin");
    navigate("/");
  }

  /**
   * Check if token is expired and refresh if needed
   */
  public async checkTokenValidity(): Promise<boolean> {
    try {
      const response = await api.get("/auth/profile");
      return response.data.success;
    } catch {
      // Token is invalid, clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
  }

  /**
   * Auto-login with social providers
   */
  public async socialLogin(
    provider: "google" | "facebook" | "telegram",
    providerData: any,
    navigate: (path: string) => void,
  ): Promise<AuthResponse> {
    try {
      const response = await api.post(`/auth/${provider}`, providerData);

      if (response.data.success) {
        const userData = response.data.data;

        // Store authentication data
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Handle redirect after successful login
        this.handlePostAuthRedirect(navigate);

        return {
          success: true,
          message: `${provider} login successful`,
          data: userData,
        };
      } else {
        return {
          success: false,
          message: response.data.message || `${provider} login failed`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `${provider} login failed`,
      };
    }
  }

  /**
   * Verify OTP
   */
  public async verifyOTP(
    phone: string,
    otp: string,
    navigate: (path: string) => void
  ): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/verify-otp", { phone, otp });

      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        this.handlePostAuthRedirect(navigate);

        return {
          success: true,
          message: "Phone verified successfully",
          data: userData,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Verification failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Verification failed. Please check the OTP.",
      };
    }
  }

  /**
   * Resend OTP
   */
  public async resendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/auth/resend-otp", { phone });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend OTP"
      };
    }
  }

  /**
   * Validate user session on app startup
   */
  public async validateSession(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    const isValid = await this.checkTokenValidity();
    if (!isValid) {
      return null;
    }

    return this.getCurrentUser();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export utility functions for direct use
export const isAuthenticated = () => authService.isAuthenticated();
export const getCurrentUser = () => authService.getCurrentUser();
export const requireAuth = (
  navigate: (path: string) => void,
  redirectTo: string = "/dashboard",
) => {
  if (!authService.isAuthenticated()) {
    localStorage.setItem("redirectAfterLogin", redirectTo);
    navigate("/register");
    return false;
  }
  return true;
};

// Higher-order component for protected routes
export const withAuth = <T extends object>(
  WrappedComponent: React.ComponentType<T>,
) => {
  return (props: T & { navigate?: (path: string) => void }) => {
    const navigate = props.navigate || (() => { });

    if (!authService.isAuthenticated()) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/register");
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
};
