"use client";
import type { FC, ComponentClass } from "react";
import type { LogExt } from "@/types/mod";
import { IconLink } from "@/components/icons";
import type { HasId } from "@/types/misc";

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
  Wrapper,
  ...props
}) => {
  const targetId = (target as HasId).id || "";
  const [targetType] = targetId.split(":");

  const body = (
    <>
      <dd className="content">{content}</dd>
      <dt className="target">target</dt>
      <dd className="target">
        <a href={`/${targetType}/${targetId}`}>
          {targetId}
          <IconLink />
        </a>
      </dd>
      <dt className={`type ${type}`}>type</dt>
      <dd className={`type ${type}`}>{type}</dd>
      <dt className="timestamp">timestamp</dt>
      <dd className="timestamp">{timestamp}</dd>
      <dt className="id">id</dt>
      <dd className="id">{id}</dd>
      {metadata ? (
        <>
          <dd className="metadata">
            <details>
              <summary>metadata</summary>
              <pre>{JSON.stringify(metadata, null, " ")}</pre>
            </details>
          </dd>
        </>
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
