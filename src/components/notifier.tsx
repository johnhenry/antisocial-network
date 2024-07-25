"use client";

import ToastNotification from "@/components/toast-notification";
import { useState, useEffect } from "react";

const { error } = console;

const Notifier = (props: any) => {
  const [message, setMessage] = useState<{ text: string; url?: string }>(null);
  const [spinner, setSpinner] = useState(null);
  const showNotification = (text: string, url?: string) => {
    setMessage({ text, url });
  };
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      const { id, timestamp, target, type, content, metadata } = notification;
      switch (type) {
        case "created": {
          const [nType, nId] = target.split(":");
          const link = `/${nType}/${target}`;
          showNotification(`new ${nType} created`, link);
        }
      }
    };
    eventSource.onerror = (e) => {
      setSpinner(null);
      error("SSE error:", e);
      eventSource.close();
    };
    setSpinner(() => () => (<div className="spinner" />) as any);
    return () => {
      try {
        setSpinner(null);
        eventSource.close();
      } catch (e) {
        error(e);
      }
    };
  }, []);
  return <ToastNotification {...props} message={message} Spinner={spinner} />;
};
export default Notifier;
