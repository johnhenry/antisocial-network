import type { FC } from "react";
import type { Agent } from "@/types/types";
type Props = {
  masquerade: Agent | null;
  setMasquerade: (agent: Agent | null) => void;
};
const Masquerade: FC<Props> = ({
  masquerade,
  setMasquerade,
  children,
  ...props
}) => {
  return masquerade ? (
    <div {...props}>
      {children}
      <p>
        <a href={`/agent/${masquerade.id}`}>
          Masquerading as {masquerade.name}
        </a>
      </p>
      <button className="close" onClick={() => setMasquerade(null)}>
        x
      </button>
    </div>
  ) : null;
};

export default Masquerade;
