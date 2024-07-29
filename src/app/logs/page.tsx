"use client";
import type { FC, ComponentClass } from "react";
import type { LogExt } from "@/types/mod";
import InfiniteScroller from "@/components/infinite-scroller";
import { getLogsExternal } from "@/lib/database/mod";
import { usePathname } from "next/navigation";

import Log from "@/components/log";

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
      <div className="infinite-scroller-window">
        <InfiniteScroller
          fetchChildren={fetchChildren(0)}
          ChildRenderer={Log}
          childProps={{ className: "log", Wrapper: "dl" }}
          FinalItem={({ className = "", children, ...props }) => (
            <li className={`${className} log loading`} {...props}>
              {children}
            </li>
          )}
        />
      </div>
    </article>
  );
};
export default Page;
