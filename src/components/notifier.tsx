"use client";

import type { FC, ComponentType, ReactNode, ReactElement } from "react";
import { cloneElement } from "react";

import type { Message } from "@/components/toast-notification";
import { useState, useEffect } from "react";
import clsx from "clsx";
const { error } = console;
type Props = {
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
  path = "/api/notifications",
}) => {
  const [message, setMessage] = useState<Message>();
  const [active, setActive] = useState<boolean>(false);
  const [seen, setSeen] = useState(new Set());

  const showNotification = (text: string, url?: string, type?: string) => {
    setMessage({ text, url, type });
  };
  useEffect(() => {
    const eventSource = new EventSource(path);
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      const { target, type } = notification;
      const record = `${type}:${target}`;
      if (seen.has(record)) {
        return;
      }
      seen.add(record);
      setSeen(new Set(seen));
      setTimeout(() => {
        seen.delete(record);
        setSeen(new Set(seen));
      }, cacheTime);
      switch (type) {
        case "create-temp":
          // I do not want to show a temorary notification for this
          // as to not inspire the user to visit the page before it's ready.
          break;
        case "created":
          {
            const [nType] = target.split(":");
            const link = `/${nType}/${target}`;
            showNotification(`New ${nType} created!`, link, type);
          }
          break;
        case "updated":
          {
            const [nType] = target.split(":");
            const link = `/${nType}/${target}`;
            showNotification(`${nType} updated!`, link, type);
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
