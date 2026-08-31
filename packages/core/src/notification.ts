export interface Notification {
  id: string;
  channel: "console" | "file" | "webhook";
  severity: "info" | "warning" | "error";
  message: string;
  timestamp: string;
}

export type NotificationHandler = (notification: Notification) => void | Promise<void>;

/**
 * Event-driven notification dispatcher for analytical alerts.
 */
export class NotificationDispatcher {
  private readonly handlers: NotificationHandler[] = [];

  subscribe(handler: NotificationHandler): void {
    this.handlers.push(handler);
  }

  async dispatch(severity: "info" | "warning" | "error", message: string, channel: "console" | "file" | "webhook" = "console"): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      channel,
      severity,
      message,
      timestamp: new Date().toISOString(),
    };

    for (const handler of this.handlers) {
      await handler(notification);
    }

    return notification;
  }
}
