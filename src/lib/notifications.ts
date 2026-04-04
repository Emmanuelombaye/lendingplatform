import { formatCurrencyTZS, formatDateTZ } from './locale';

export interface NotificationPayload {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  userId?: string;
  loanId?: string;
  persistent?: boolean;
}

class NotificationService {
  private notificationQueue: NotificationPayload[] = [];
  private listeners: ((notification: NotificationPayload) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Only register SW — never auto-request notification permission
      this.initializeServiceWorker();
    }
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {
        // SW registration failure is non-critical
      }
    }
  }

  // Only request permission when user explicitly triggers a notification action
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(payload: NotificationPayload) {
    this.notificationQueue.push(payload);
    this.notifyListeners(payload);
    this.storeNotification(payload);

    // Only show browser notification if already granted — never prompt
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      this.showBrowserNotification(payload);
    }

    if (!payload.persistent) {
      setTimeout(() => this.removeNotification(payload.id), 5000);
    }
  }

  private showBrowserNotification(payload: NotificationPayload) {
    try {
      const n = new Notification(payload.title, {
        body: payload.message,
        icon: '/logovertex.png',
        tag: payload.id,
        requireInteraction: payload.persistent || false,
        data: { actionUrl: payload.actionUrl },
      });
      n.onclick = () => {
        if (payload.actionUrl) { window.focus(); window.location.href = payload.actionUrl; }
        n.close();
      };
      if (!payload.persistent) setTimeout(() => n.close(), 5000);
    } catch { /* ignore */ }
  }

  private storeNotification(payload: NotificationPayload) {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      stored.unshift({ ...payload, timestamp: payload.timestamp.toISOString() });
      localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 50)));
    } catch { /* ignore */ }
  }

  getStoredNotifications(): NotificationPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('notifications') || '[]')
        .map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
    } catch { return []; }
  }

  removeNotification(id: string) {
    this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      localStorage.setItem('notifications', JSON.stringify(stored.filter((n: any) => n.id !== id)));
    } catch { /* ignore */ }
  }

  markAsRead(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const stored = this.getStoredNotifications();
      localStorage.setItem('notifications', JSON.stringify(
        stored.map(n => ({ ...n, read: n.id === id ? true : (n as any).read, timestamp: n.timestamp.toISOString() }))
      ));
    } catch { /* ignore */ }
  }

  subscribe(callback: (notification: NotificationPayload) => void) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  }

  private notifyListeners(payload: NotificationPayload) {
    this.listeners.forEach(l => { try { l(payload); } catch { /* ignore */ } });
  }

  clearAll() {
    this.notificationQueue = [];
    if (typeof window !== 'undefined') localStorage.removeItem('notifications');
  }

  getUnreadCount(): number {
    return this.getStoredNotifications().filter(n => !(n as any).read).length;
  }

  // Loan notification helpers
  showLoanApprovalNotification(loanId: string, amount: number) {
    this.showNotification({
      id: `loan-approved-${loanId}-${Date.now()}`,
      type: 'success',
      title: '🎉 Loan Approved!',
      message: `Your loan of ${formatCurrencyTZS(amount)} has been approved.`,
      timestamp: new Date(),
      actionUrl: '/dashboard',
      loanId,
      persistent: true,
    });
  }

  showPaymentReminderNotification(amount: number, dueDate: string) {
    this.showNotification({
      id: `payment-reminder-${Date.now()}`,
      type: 'warning',
      title: 'Payment Reminder',
      message: `Payment of ${formatCurrencyTZS(amount)} is due on ${formatDateTZ(dueDate)}.`,
      timestamp: new Date(),
      actionUrl: '/dashboard',
    });
  }

  showPaymentReceivedNotification(amount: number) {
    this.showNotification({
      id: `payment-received-${Date.now()}`,
      type: 'success',
      title: 'Payment Received',
      message: `Your payment of ${formatCurrencyTZS(amount)} was successful.`,
      timestamp: new Date(),
      actionUrl: '/dashboard',
    });
  }
}

export const notificationService = new NotificationService();
