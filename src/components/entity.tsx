import type { FC, ComponentClass, ReactNode } from "react";
import type { EntityExt, PostExt } from "@/types/mod";
import Post from "@/components/post";

type EntityProps = EntityExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
};

const Entity: FC<EntityProps> = (entity) => {
  const [type, id] = entity.id.split(":");
  switch (type) {
    case "post":
      return <Post {...(entity as PostExt)} className="post" />;
    case "file":
    // return <File file={entity} />;
    case "agent":
    // return <Agent agent={entity} />;
    default:
      return <div className="post">Unknown entity type: {type}</div>;
  }
};
export default Entity;
