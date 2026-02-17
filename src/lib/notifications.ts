// Notification Service for Vertex Loans
// Handles push notifications, approval/rejection alerts, and real-time updates

export interface NotificationPayload {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  userId?: string;
  loanId?: string;
  persistent?: boolean;
}

export interface NotificationConfig {
  enableBrowserNotifications: boolean;
  enableSoundAlerts: boolean;
  enableToastNotifications: boolean;
  autoHideDelay: number; // milliseconds
}

class NotificationService {
  private config: NotificationConfig = {
    enableBrowserNotifications: true,
    enableSoundAlerts: true,
    enableToastNotifications: true,
    autoHideDelay: 5000,
  };

  private notificationQueue: NotificationPayload[] = [];
  private listeners: ((notification: NotificationPayload) => void)[] = [];

  constructor() {
    this.requestPermission();
    this.initializeServiceWorker();
  }

  // Request browser notification permission
  async requestPermission(): Promise<boolean> {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Initialize service worker for background notifications
  private async initializeServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered for notifications");
      } catch (error) {
        console.warn("Service Worker registration failed:", error);
      }
    }
  }

  // Configure notification settings
  configure(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem("notificationConfig", JSON.stringify(this.config));
  }

  // Load configuration from localStorage
  loadConfiguration() {
    const stored = localStorage.getItem("notificationConfig");
    if (stored) {
      try {
        this.config = { ...this.config, ...JSON.parse(stored) };
      } catch (error) {
        console.warn("Failed to load notification config:", error);
      }
    }
  }

  // Show notification
  async showNotification(payload: NotificationPayload) {
    this.notificationQueue.push(payload);
    this.notifyListeners(payload);

    // Store in localStorage for persistence
    this.storeNotification(payload);

    // Show browser notification if enabled and permission granted
    if (this.config.enableBrowserNotifications && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.showBrowserNotification(payload);
      }
    }

    // Play sound alert if enabled
    if (this.config.enableSoundAlerts) {
      this.playNotificationSound(payload.type);
    }

    // Auto-hide non-persistent notifications
    if (!payload.persistent && this.config.autoHideDelay > 0) {
      setTimeout(() => {
        this.removeNotification(payload.id);
      }, this.config.autoHideDelay);
    }
  }

  // Show browser notification
  private showBrowserNotification(payload: NotificationPayload) {
    const notification = new Notification(payload.title, {
      body: payload.message,
      icon: "/logovertex.png",
      badge: "/logovertex.png",
      tag: payload.id,
      requireInteraction: payload.persistent || false,
      data: {
        actionUrl: payload.actionUrl,
        loanId: payload.loanId,
        timestamp: payload.timestamp,
      },
    });

    notification.onclick = () => {
      if (payload.actionUrl) {
        window.focus();
        window.location.href = payload.actionUrl;
      }
      notification.close();
    };

    // Auto-close after delay
    if (!payload.persistent) {
      setTimeout(() => notification.close(), this.config.autoHideDelay);
    }
  }

  // Play notification sound based on type
  private playNotificationSound(type: NotificationPayload["type"]) {
    try {
      const audio = new Audio();

      switch (type) {
        case "success":
          audio.src = "/sounds/success.mp3";
          break;
        case "warning":
          audio.src = "/sounds/warning.mp3";
          break;
        case "error":
          audio.src = "/sounds/error.mp3";
          break;
        default:
          audio.src = "/sounds/notification.mp3";
      }

      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.warn("Could not play notification sound:", error);
      });
    } catch (error) {
      console.warn("Error playing notification sound:", error);
    }
  }

  // Store notification in localStorage
  private storeNotification(payload: NotificationPayload) {
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      stored.unshift({
        ...payload,
        timestamp: payload.timestamp.toISOString(),
      });

      // Keep only last 50 notifications
      const trimmed = stored.slice(0, 50);
      localStorage.setItem("notifications", JSON.stringify(trimmed));
    } catch (error) {
      console.warn("Failed to store notification:", error);
    }
  }

  // Get stored notifications
  getStoredNotifications(): NotificationPayload[] {
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      return stored.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.warn("Failed to load stored notifications:", error);
      return [];
    }
  }

  // Remove notification
  removeNotification(id: string) {
    this.notificationQueue = this.notificationQueue.filter((n) => n.id !== id);

    // Remove from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const filtered = stored.filter((n: any) => n.id !== id);
      localStorage.setItem("notifications", JSON.stringify(filtered));
    } catch (error) {
      console.warn("Failed to remove notification from storage:", error);
    }
  }

  // Mark notification as read
  markAsRead(id: string) {
    const stored = this.getStoredNotifications();
    const updated = stored.map((n) => (n.id === id ? { ...n, read: true } : n));

    try {
      localStorage.setItem(
        "notifications",
        JSON.stringify(
          updated.map((n) => ({
            ...n,
            timestamp: n.timestamp.toISOString(),
          })),
        ),
      );
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
    }
  }

  // Subscribe to notifications
  subscribe(callback: (notification: NotificationPayload) => void) {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  // Notify all listeners
  private notifyListeners(payload: NotificationPayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.warn("Error in notification listener:", error);
      }
    });
  }

  // Loan-specific notification methods
  showLoanApprovalNotification(loanId: string, amount: number) {
    this.showNotification({
      id: `loan-approved-${loanId}-${Date.now()}`,
      type: "success",
      title: "🎉 Loan Approved!",
      message: `Congratulations! Your loan of KES ${amount.toLocaleString()} has been approved. Funds will be disbursed within 24 hours.`,
      timestamp: new Date(),
      actionUrl: "/dashboard",
      loanId,
      persistent: true,
    });
  }

  showLoanRejectionNotification(loanId: string, reason?: string) {
    this.showNotification({
      id: `loan-rejected-${loanId}-${Date.now()}`,
      type: "error",
      title: "Loan Application Update",
      message: reason
        ? `Your loan application has been declined. Reason: ${reason}`
        : "Your loan application has been declined. Please contact support for more information.",
      timestamp: new Date(),
      actionUrl: "/apply",
      loanId,
      persistent: true,
    });
  }

  showProcessingFeeNotification(amount: number, loanId: string) {
    this.showNotification({
      id: `processing-fee-${loanId}-${Date.now()}`,
      type: "info",
      title: "Processing Fee Charged",
      message: `A processing fee of KES ${amount.toLocaleString()} has been charged to your account for loan #${loanId}.`,
      timestamp: new Date(),
      actionUrl: "/dashboard",
      loanId,
    });
  }

  showPaymentReminderNotification(amount: number, dueDate: string) {
    this.showNotification({
      id: `payment-reminder-${Date.now()}`,
      type: "warning",
      title: "Payment Reminder",
      message: `Your payment of KES ${amount.toLocaleString()} is due on ${dueDate}. Please make your payment on time to avoid late fees.`,
      timestamp: new Date(),
      actionUrl: "/dashboard",
    });
  }

  showPaymentReceivedNotification(amount: number) {
    this.showNotification({
      id: `payment-received-${Date.now()}`,
      type: "success",
      title: "Payment Received",
      message: `Thank you! Your payment of KES ${amount.toLocaleString()} has been processed successfully.`,
      timestamp: new Date(),
      actionUrl: "/dashboard",
    });
  }

  // Clear all notifications
  clearAll() {
    this.notificationQueue = [];
    localStorage.removeItem("notifications");
  }

  // Get unread count
  getUnreadCount(): number {
    const stored = this.getStoredNotifications();
    return stored.filter((n) => !(n as any).read).length;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize configuration on load
notificationService.loadConfiguration();

// React hooks (to be used in React components)
export const createNotificationHooks = () => {
  return {
    useNotifications: () => {
      // This will be imported and used in React components
      // The actual React hooks will be defined in the component files
      return {
        notifications: [],
        showNotification: (payload: NotificationPayload) =>
          notificationService.showNotification(payload),
        removeNotification: (id: string) =>
          notificationService.removeNotification(id),
        markAsRead: (id: string) => notificationService.markAsRead(id),
        clearAll: () => notificationService.clearAll(),
        unreadCount: notificationService.getUnreadCount(),
      };
    },
  };
};
