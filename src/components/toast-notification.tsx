import { useState, useEffect, useCallback, FC, ComponentType } from "react";

export type Message = {
  text: string;
  url?: string;
  type?: string;
};

type Notification = {
  id: number;
  text: string;
  url?: string;
  type?: string;
  createdAt: number;
  expiresAt: number;
  isPaused: boolean;
  pausedAt?: number;
  onRemove?: () => void;
};

type Props = {
  duration?: number;
  message?: Message;
  className?: string;
  Wrapper?: ComponentType<any> | string;
};

const ToastNotification: FC<Props> = ({
  duration = 5000,
  className,
  Wrapper = "div",
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
        text: props.message.text,
        url: props.message.url,
        type: props.message.type,
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
    <Wrapper className={className} {...props}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={[
            notification.isPaused ? "paused" : "",
            notification.type || "",
          ].join(" ")}
          onMouseEnter={() => pauseTimer(notification.id)}
          onMouseLeave={() => resumeTimer(notification.id)}
        >
          {notification.url ? (
            <a href={notification.url}>{notification.text}</a>
          ) : (
            notification.text
          )}
          <button
            title="close"
            onClick={() => removeNotification(notification.id)}
          >
            x
          </button>
        </div>
      ))}
    </Wrapper>
  );
};

export default ToastNotification;
