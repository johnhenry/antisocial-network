import React, { useState, useEffect, useCallback, ReactNode } from "react";

interface Message {
  text: string;
  url?: string;
}

interface Notification {
  id: number;
  message: string;
  url?: string;
  createdAt: number;
  expiresAt: number;
  isPaused: boolean;
  pausedAt?: number;
  onRemove?: () => void;
}

interface ToastNotificationProps {
  duration?: number;
  Spinner?: React.ComponentType;
  message?: Message;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  duration = 5000,
  Spinner,
  ...props
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const pauseTimer = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isPaused: true, pausedAt: Date.now() }
          : notification
      )
    );
  }, []);

  const resumeTimer = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === id && notification.isPaused) {
          const pauseDuration = Date.now() - notification.pausedAt!;
          return {
            ...notification,
            isPaused: false,
            expiresAt: notification.expiresAt + pauseDuration,
          };
        }
        return notification;
      })
    );
  }, []);

  useEffect(() => {
    if (props.message) {
      const newNotification: Notification = {
        id: Date.now(),
        message: props.message.text,
        url: props.message.url,
        createdAt: Date.now(),
        expiresAt: Date.now() + duration,
        isPaused: false,
      };
      setNotifications((prev) => [...prev, newNotification]);
    }
  }, [props.message, duration]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNotifications((prev) =>
        prev.filter((notification) => {
          if (notification.isPaused) return true;
          const shouldRemove = now >= notification.expiresAt;
          if (shouldRemove) {
            notification.onRemove?.();
          }
          return !shouldRemove;
        })
      );
    }, 100); // Check every 100ms

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="toast-notification" {...props}>
      {Spinner ? <Spinner /> : null}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast-item ${notification.isPaused ? "paused" : ""}`}
          onMouseEnter={() => pauseTimer(notification.id)}
          onMouseLeave={() => resumeTimer(notification.id)}
        >
          {notification.url ? (
            <a href={notification.url}>{notification.message}</a>
          ) : (
            notification.message
          )}
          <button onClick={() => removeNotification(notification.id)}>
            Close
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
