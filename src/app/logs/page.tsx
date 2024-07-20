"use client";
import type { FC, RefObject } from "react";
import type { LogExt } from "@/types/mod";
import { useRef, useState } from "react";
import InfiniteScroller from "@/components/infinite-scroller";
import { getLogsExternal } from "@/lib/create/mod";
import { usePathname } from "next/navigation";
const MiniLog = ({ id, timestamp, content, metadata }: LogExt) => (
  <li title={id} className="log">
    {content}
    {metadata ? (
      <details title={String(timestamp)}>
        <summary>Metadata</summary>
        <pre>{JSON.stringify(metadata, null, " ")}</pre>
      </details>
    ) : null}
  </li>
);
const SIZE = 10;
type PageProps = {};
const Page: FC<PageProps> = ({}) => {
  const pathname = usePathname();
  const classes = pathname.split("/").filter(Boolean).join(" ");

  const fetchChildren = (start = 0) => {
    let offset = start;
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newItmes = await getLogsExternal(offset, SIZE);
      offset += newItmes.length;
      return newItmes;
    };
  };
  return (
    <article className={classes}>
      <div className="infinite-scroller-window log-list-window">
        <ul className="infinite-scroller log-list">
          <InfiniteScroller
            fetchChildren={fetchChildren(0)}
            ChildRenderer={MiniLog}
            initialItems={[]}
            FinalItem={({ children, ...props }) => (
              <li {...props}>{children}</li>
            )}
          />
        </ul>
      </div>
    </article>
  );
};
export default Page;
