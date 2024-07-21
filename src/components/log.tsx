"use client";
import type { FC, ComponentClass } from "react";
import type { LogExt } from "@/types/mod";
import { RxExternalLink } from "react-icons/rx";

type LogProps = LogExt & {
  Wrapper?: ComponentClass<any> | string;
};

const Log: FC<LogProps> = ({
  id,
  timestamp,
  content,
  target,
  metadata,
  type,
  Wrapper = "li",
  ...props
}) => {
  const [targetType] = target.split(":");

  const body = (
    <>
      <header className={type}>
        <span className="type">{type}</span>
        <span className="timestamp">
          {new Date(timestamp).toLocaleString()}
        </span>

        <a className="target" href={`${targetType}/${target}`}>
          {target}
          <RxExternalLink />
        </a>
      </header>
      <main>{content}</main>
      {metadata ? (
        <footer>
          <details title={String(timestamp)}>
            <summary>Metadata</summary>
            <pre>{JSON.stringify(metadata, null, " ")}</pre>
          </details>
        </footer>
      ) : null}
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};

export default Log;
