import type { FC } from "react";
import type { JSONExtendedObject } from "@/types/json-extended";
import TOOLS from "@/tools/mod";
import { Fragment, ReactNode } from "react";
import JSONExtended from "@/types/json-extended";
import type { Tool } from "@/types/tools";

const Tool: FC<Tool> = ({ descriptor, handler }) => {
  const { name } = descriptor.function;
  const { description } = descriptor.function;
  const { properties } = descriptor.function.parameters;

  return (
    <>
      <h3>#{name}</h3>
      <p>{description}</p>
      <table>
        <tbody>
          {Object.entries(properties).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <details>
        <summary>Handler</summary>
        <pre>{handler.toString()}</pre>
      </details>
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
