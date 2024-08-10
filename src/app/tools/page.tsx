import type { FC } from "react";
import type { RegisteredDescriptor } from "@/types/tools";
import TOOLS from "@/tools/descriptors";

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
      {Object.entries(TOOLS).map(
        ([name, tool]: [string, RegisteredDescriptor]) => (
          <Tool key={name} {...tool} />
        )
      )}
    </article>
  );
};

export default Page;
