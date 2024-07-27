"use client";

import type { FC } from "react";
import { useRef } from "react";

import { createCronExternal } from "@/lib/database/mod";

import obfo from "obfo";

const Page: FC = () => {
  const scheule = useRef<HTMLElement>();
  const submit = async () => {
    const data = obfo<{
      on?: boolean;
      schedule: string;
      content: string;
      sourceId?: string;
      targetId?: string;
      timezone: string;
    }>(scheule.current!);
    console.log(data);
    await createCronExternal(data);
  };

  return (
    <article data-obfo-container="{}" ref={scheule as any}>
      <h2>Schedule</h2>
      <form>
        <label>
          On
          <input
            type="checkbox"
            name="on"
            data-obfo-cast="checkbox"
            defaultChecked
          />
        </label>
        <label>
          Schedule
          <input type="text" name="schedule" defaultValue="*/30 * * * * *" />
        </label>
        <label>
          Source
          <input type="text" name="sourceId" />
        </label>
        <label>
          Target
          <input type="text" name="targetId" />
        </label>
        <label>
          Timezone
          <input type="text" name="timezone" />
        </label>
        <label>
          Content
          <textarea name="content" />
        </label>
        <button type="submit" onClick={() => submit()}>
          Create
        </button>
      </form>
    </article>
  );
};
export default Page;
