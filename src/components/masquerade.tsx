import type { FC } from "react";
import type { Agent } from "@/types/types";
type Props = {
  masquerade: Agent | null;
  setMasquerade: (agent: Agent | null) => void;
};
const Masquerade: FC<Props> = ({ masquerade, setMasquerade, ...props }) => {
  return masquerade ? (
    <div {...props}>
      <p>Masquerading as {masquerade.name}</p>
      <button className="close" onClick={() => setMasquerade(null)}>
        x
      </button>
    </div>
  ) : null;
};

export default Masquerade;
