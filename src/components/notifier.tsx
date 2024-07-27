"use client";

import type { FC, ComponentType } from "react";

import type { Message } from "@/components/toast-notification";
import ToastNotification from "@/components/toast-notification";
import { useState, useEffect } from "react";

const { error } = console;
type Props = {
  className?: string;
  duration?: number;
  Wrapper?: ComponentType<any> | string;
};

const Notifier: FC<Props> = ({
  className,
  duration,
  Wrapper = "div",
  ...props
}) => {
  const [message, setMessage] = useState<Message>();
  const [active, setActive] = useState<boolean>(false);
  const [seen, setSeen] = useState(new Set());

  const showNotification = (text: string, url?: string, type?: string) => {
    setMessage({ text, url, type });
  };
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      const { id, timestamp, target, type, content, metadata } = notification;
      const record = `${type}:${target}`;
      if (seen.has(record)) {
        return;
      }
      seen.add(record);
      setSeen(new Set(seen));
      switch (type) {
        case "create-temp":
          // I do not want to show a temorary notification for this
          // as to not inspire the user to visit the page before it's ready.
          break;
        case "created":
          {
            const [nType] = target.split(":");
            const link = `/${nType}/${target}`;
            showNotification(`${record} New ${nType} created!`, link, type);
          }
          break;
        case "updated":
          {
            const [nType] = target.split(":");
            const link = `/${nType}/${target}`;
            showNotification(`(${target}) updated!`, link, type);
          }
          break;
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
      Wrapper={Wrapper}
      className={[active ? "active" : "", className].join(" ")}
    />
  );
};
export default Notifier;
