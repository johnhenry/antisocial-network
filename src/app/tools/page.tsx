import type { JSONExtendedObject } from "@/types/json-extended";
import * as tools from "@/tools/mod";
import { Fragment, ReactNode } from "react";
import JSONExtended from "@/types/json-extended";

const JsonToHtmlMapper = ({ data }: { data: JSONExtendedObject }) => {
  const renderValue = (value: JSONExtendedObject, key: string): ReactNode => {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return (
          <ol className={key}>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, `${key}-item`)}</li>
            ))}
          </ol>
        );
      } else {
        return (
          <dl className={key}>
            {Object.entries(value).map(
              ([subKey, subValue]: [string, JSONExtended]) => (
                <Fragment key={subKey}>
                  <dt>{subKey}</dt>
                  <dd>{renderValue(subValue as never, subKey)}</dd>
                </Fragment>
              )
            )}
          </dl>
        );
      }
    } else {
      return <span className={key}>{String(value)}</span>;
    }
  };

  return renderValue(data, "");
};

const Page = () => {
  return (
    <article>
      <h2>Tools</h2>
      <dl>
        {Object.entries(tools).map(
          ([key, { descriptor }]: [
            string,
            { descriptor: JSONExtendedObject }
          ]) => (
            <Fragment key={key}>
              <dt>{key}</dt>
              <dd>
                <details>
                  <summary></summary>
                  <JsonToHtmlMapper data={descriptor} />
                </details>
              </dd>
            </Fragment>
          )
        )}
      </dl>
    </article>
  );
};

export default Page;
