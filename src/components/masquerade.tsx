"use client";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import type { FC, ReactNode } from "react";
import type { Agent } from "@/types/types";
type Props = {
  masquerade: Agent | null;
  children?: ReactNode;
  className?: string;
  setmasquerade?: any;
};
import { MASQUERADE_KEY } from "@/settings";

const Masquerade: FC<Props> = ({
  masquerade,
  children,
  setmasquerade,
  ...props
}) => {
  // const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
  //   MASQUERADE_KEY,
  //   null
  // );
  return masquerade ? (
    <div {...props}>
      {children}
      <p>
        <a href={`/agent/${masquerade.id}`}>
          Masquerading as {masquerade.name}
        </a>
      </p>
      <button className="close" onClick={() => setmasquerade(null)}>
        x
      </button>
    </div>
  ) : null;
};

export default Masquerade;

/*
"use client";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import type { FC, ReactNode } from "react";
import type { Agent } from "@/types/types";
type Props = {
  masquerade: Agent | null;
  children?: ReactNode;
  className?: string;
};
import { MASQUERADE_KEY } from "@/settings";

const Masquerade: FC<Props> = ({ children, ...props }) => {
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  return masquerade ? (
    <div {...props}>
      {children}
      <p>
        <a href={`/agent/${masquerade.id}`}>
          Masquerading as {masquerade.name}
        </a>
      </p>
      <button className="close" onClick={() => setmasquerade(null)}>
        x
      </button>
    </div>
  ) : null;
};

export default Masquerade;
*/
