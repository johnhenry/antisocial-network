"use client";

import type { FC, ComponentClass } from "react";
import type { Message } from "@/components/toast-notification";
import ToastNotification from "@/components/toast-notification";
import { useState, useEffect } from "react";

const { error } = console;
type Props = {
  className?: string;
  duration?: number;
};

const Notifier: FC<Props> = ({
  className = "toast-notification",
  duration,
  ...props
}) => {
  const [message, setMessage] = useState<Message>();
  const [active, setActive] = useState<boolean>(false);
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
      setActive(false);
      error("SSE error:", e);
      eventSource.close();
    };
    setActive(true);
    return () => {
      try {
        setActive(false);
        eventSource.close();
      } catch (e) {
        error(e);
      }
    };
  }, []);
  return (
    <ToastNotification
      {...props}
      duration={duration}
      message={message}
      className={[active ? "active" : "", className].join(" ")}
    />
  );
};
export default Notifier;
