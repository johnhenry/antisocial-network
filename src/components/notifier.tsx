"use client";
import ToastNotification from "@/components/toast-notification";
import { useState, useEffect } from "react";

const { error } = console;

const Notifier = (props) => {
  const [message, setMessage] = useState(null);
  const showNotification = (text, url = null) => {
    setMessage({ text, url });
  };
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");
    eventSource.onmessage = (event) => {
      const created = JSON.parse(event.data);
      for (const [id] of created) {
        const type = id.split(":")[0];
        const link = `/${type}/${id}`;
        showNotification(`new ${type} created`, link);
      }
    };
    eventSource.onerror = (e) => {
      error("SSE error:", e);
      eventSource.close();
    };
    return () => {
      try {
        eventSource.close();
      } catch (e) {
        error(e);
      }
    };
  }, []);
  return <ToastNotification {...props} message={message} />;
};
export default Notifier;
