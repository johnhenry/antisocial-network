"use client";
import type { FC, ReactNode } from "react";
import { useState } from "react";

import { relate, unrelate } from "@/lib/db";

type RelationshipTogglerProps = {
  className?: string;
  relationship?: string;
  collection?: string[];
  inn: string;
  out: string;
  Wrapper?: ReactNode | FC<any> | string;
  children?: ReactNode;
};

const RelationshipToggler: FC<RelationshipTogglerProps> = ({
  inn,
  out,
  relationship = "",
  collection = [],
  className = "",
  Wrapper = "a",
  children,
  ...props
}) => {
  const [col, setCol] = useState<string[]>(collection);
  const toggleRelates = async (id: string) => {
    console.log("TOGGLING RELATIONSHIP", relationship, inn, out);

    if (col.includes(id)) {
      setCol(col.filter((r) => r !== id));
      await unrelate(id, relationship, out);
    } else {
      setCol([...col, id]);
      await relate(id, relationship, out);
    }
  };
  if (!Wrapper) {
    return null;
  }
  return (
    <Wrapper
      onClick={() => toggleRelates(inn)}
      className={`${className} ${col.includes(inn) ? relationship : ""}`}
      {...props}
    >
      {children}
    </Wrapper>
  );
};
export default RelationshipToggler;
