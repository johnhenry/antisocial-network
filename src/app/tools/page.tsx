import type { FC } from "react";
import type { JSONExtendedObject } from "@/types/json-extended";
import TOOLS from "@/tools/descriptors";
import { Fragment, ReactNode } from "react";
import JSONExtended from "@/types/json-extended";
import type { RegisteredDescriptor } from "@/types/tools";

const Tool: FC<RegisteredDescriptor> = ({
  name,
  description,
  function: {
    parameters: { properties },
  },
}) => {
  return (
    <>
      <h3>#{name}</h3>
      <p>{description}</p>
      <table>
        <tbody>
          {Object.entries(properties).map(([key, value]: [string, any]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const Page = () => {
  return (
    <article>
      <h2>Tools</h2>
      {Object.entries(TOOLS).map(([name, tool]: [string, Tool]) => (
        <Tool key={name} {...tool} />
      ))}
    </article>
  );
};

export default Page;
