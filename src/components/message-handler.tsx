"use client";
import type { ReactNode, ReactElement } from "react";
import { useState, useEffect, FC, cloneElement } from "react";

export type Message = any;

type Props = {
  message?: Message;
  children: ReactNode;
  filter?: (item: Message) => boolean;
  map?: (item: Message) => Message;
  onMessage?: (message: Message) => void;
};

const ToastNotification: FC<Props> = ({
  filter = () => true,
  map = (item) => item,
  onMessage = () => {},
  children,
  ...props
}) => {
  const [message, setMessage] = useState<Message>();

  useEffect(() => {
    if (props.message) {
      const finalMessage = map(props.message);
      if (!finalMessage) {
        return;
      }
      onMessage(finalMessage);
      setMessage(finalMessage);
    }
  }, [props.message]);

  const UpdatedChildren = [];
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child: ReactElement, key) => {
        UpdatedChildren.push(
          cloneElement(child, {
            key,
            message,
          })
        );
      });
    } else {
      const child: ReactElement = children as ReactElement;
      UpdatedChildren.push(
        cloneElement(child, {
          message,
        })
      );
    }
  }
  return UpdatedChildren;
};

export default ToastNotification;
