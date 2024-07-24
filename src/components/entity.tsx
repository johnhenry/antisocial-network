import type { FC, ComponentClass, ReactNode } from "react";
import type {
  EntityExt,
  PostExt,
  AgentExt,
  FileExt,
  AgentPlusExt,
} from "@/types/mod";
import Post from "@/components/post";
import File from "@/components/file";
import Agent from "@/components/agent";
type EntityProps = EntityExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentPlusExt;
  setMasquerade?: (masquerade: AgentPlusExt | null) => void;
};

const Entity: FC<EntityProps> = (entity) => {
  const [type, id] = entity.id.split(":");
  switch (type) {
    case "post":
      return <Post {...(entity as PostExt)} className="entity post" />;
    case "file":
      return <File {...(entity as FileExt)} className="entity file" />;
    case "agent":
      return <Agent {...(entity as AgentExt)} className="entity agent" />;
    default:
      return <div className="post">Unknown entity type: {type}</div>;
  }
};
export default Entity;
