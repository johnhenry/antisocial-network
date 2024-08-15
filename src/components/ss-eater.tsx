"use client";

import type { FC, ComponentType, ReactNode, ReactElement } from "react";
import { cloneElement } from "react";

import type { Message } from "@/components/toast-notification";
import { useState, useEffect } from "react";
import clsx from "clsx";
const { error } = console;
type Props = {
  src: string;
  className?: string;
  duration?: number;
  cacheTime?: number;
  children: ReactNode;
  path?: string;
  Wrapper?: ComponentType<any> | string;
};

const Notifier: FC<Props> = ({
  cacheTime = 5000,
  children,
  src = "/api/notifications",
}) => {
  const [message, setMessage] = useState<Message>();
  const [active, setActive] = useState<boolean>(false);
  const [seen, setSeen] = useState(new Set());

  const showNotification = (text: string, url?: string, type?: string) => {
    setMessage({ text, url, type });
  };
  useEffect(() => {
    let eventSource: EventSource;
    const connect = () => {
      eventSource = new EventSource(src);
      eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        const { id } = notification;
        if (seen.has(id)) {
          return;
        }
        setMessage(JSON.parse(event.data));
        seen.add(id);
        setSeen(new Set(seen));
        setTimeout(() => {
          seen.delete(id);
          setSeen(new Set(seen));
        }, cacheTime);
      };
      eventSource.onerror = (e) => {
        setActive(false);
        error("SSE error:", e);
        try {
          eventSource.close();
        } finally {
          setTimeout(connect, 1000);
        }
      };
      setActive(true);
    };
    connect();
    return () => {
      try {
        setActive(false);
        eventSource.close();
      } catch (e) {
        error(e);
      }
    };
  }, []);
  const UpdatedChildren = [];
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child: ReactElement, key) => {
        UpdatedChildren.push(
          cloneElement(child, {
            key,
            showNotification,
            className: clsx(child.props.className, { active }),
          })
        );
      });
    } else {
      const child: ReactElement = children as ReactElement;
      UpdatedChildren.push(
        cloneElement(child, {
          message,
          className: clsx(child.props.className, { active }),
        })
      );
    }
  }
  return UpdatedChildren;
};
export default Notifier;
