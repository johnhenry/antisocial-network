import React, { useState, useEffect, useCallback } from "react";

const ToastNotification = ({ duration = 5000, ...props }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const pauseTimer = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isPaused: true, pausedAt: Date.now() }
          : notification
      )
    );
  }, []);

  const resumeTimer = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === id && notification.isPaused) {
          const pauseDuration = Date.now() - notification.pausedAt;
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
      const newNotification = {
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
