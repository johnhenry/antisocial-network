"use client";
import type { CronExt } from "@/types/mod";
import type { FC, ChangeEvent, LegacyRef } from "react";
import { useEffect, useRef, useState } from "react";

import type { Trigger } from "@/components/text-pop-triggers";
import {
  At_AgentName_ID,
  Hashtag_ToolName,
} from "@/components/text-pop-triggers";

const DEFAULT_TRIGGERS: Record<string, Trigger> = {
  "@": At_AgentName_ID,
  "#": Hashtag_ToolName,
};
import {
  createCronExternal,
  getAllCronExternal,
  cronStateExternal,
} from "@/lib/database/mod";

import obfo from "obfo";

import { TIME_ZONES } from "@/config/mod";

const TimezoneSelector = ({
  zones = TIME_ZONES,
  defaultValue = "+00:00",
  ...props
}) => {
  return (
    <select defaultValue={defaultValue} {...props}>
      {zones.map(([zone, location]) => (
        <option key={zone} value={zone === "±00:00" ? "+00:00" : `UTC${zone}`}>
          {`UTC${zone}`}
        </option>
      ))}
    </select>
  );
};
import TextareaWithPopup from "@/components/text-pop";
import { set } from "zod";

const Page: FC = () => {
  const textArea = useRef<LegacyRef<HTMLTextAreaElement> | undefined>(
    undefined
  );
  const [text, doText] = useState("");
  const [schedules, setSchedules] = useState<CronExt[]>([]);
  const newSchedule = useRef<HTMLElement>();
  const submit = async () => {
    const data = obfo<{
      on?: boolean;
      schedule: string;
      content: string;
      sourceId?: string;
      targetId?: string;
      timezone: string;
    }>(newSchedule.current!);
    const cron = await createCronExternal(data);
    if (!data.schedule) {
      return alert("Please enter a schedule");
    }
    if (!data.content) {
      return alert("Please enter content");
    }
    setSchedules([cron, ...schedules]);
  };
  useEffect(() => {
    const fetchSchedules = async () => {
      const schedules = await getAllCronExternal();
      setSchedules(schedules);
    };
    fetchSchedules();
    return () => {
      // cleanup
    };
  }, []);

  const updateStatus = (event: ChangeEvent<HTMLInputElement>, id: string) => {
    // alert("Restart Next JS server for changes to take effect");
    cronStateExternal(event.target.checked, id);
  };

  const deleteSchedule = (id: string) => {
    // alert("Restart Next JS server for changes to take effect");
    cronStateExternal(null, id);
    schedules.splice(
      schedules.findIndex((schedule) => schedule.id === id),
      1
    );
    setSchedules([...schedules]);
  };

  return (
    <article className="schedule-single">
      <h2>Schedule</h2>
      <form
        ref={newSchedule as any}
        data-obfo-container="{}"
        data-obfo-name="schedule"
      >
        <label>
          On
          <input
            title="on"
            type="checkbox"
            name="on"
            data-obfo-cast="checkbox"
            data-obfo-name="on"
            defaultChecked
          />
        </label>
        <label>
          Schedule
          <input
            title="schedule"
            type="text"
            name="schedule"
            defaultValue="*/30 * * * * *"
          />
        </label>
        <label>
          Source
          <input title="source" type="text" name="sourceId" />
        </label>
        <label>
          Target
          <input title="target" type="text" name="targetId" />
        </label>
        <label>
          Timezone
          <TimezoneSelector name="timezone" className="text" />
        </label>
        <label>
          Content
          <TextareaWithPopup
            placeholder="*/30 * * * * *"
            ref={textArea}
            value={text}
            triggers={DEFAULT_TRIGGERS}
            setValue={doText}
            name="content"
          />
        </label>
        <button type="button" onClick={() => submit()}>
          Create
        </button>
      </form>
      {schedules && schedules.length > 0 ? (
        <ul>
          {schedules.map((schedule) => (
            <li key={schedule.id} className="schedule">
              <header>
                <input
                  type="checkbox"
                  defaultChecked={schedule.on}
                  onChange={(event) => updateStatus(event, schedule.id)}
                ></input>

                <button
                  type="button"
                  defaultChecked={schedule.on}
                  onClick={() => deleteSchedule(schedule.id)}
                >
                  x
                </button>
              </header>
              <main>
                <label>
                  <input title="timezone" value={schedule.timezone} disabled />
                  <input title="schedule" value={schedule.schedule} disabled />
                </label>
                <textarea title="content" disabled>
                  {schedule.content}
                </textarea>
              </main>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
};
export default Page;
