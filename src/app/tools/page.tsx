import * as tools from "@/tools";
import { Fragment } from "react";

const JsonToHtmlMapper = ({ data }) => {
  const renderValue = (value, key) => {
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
            {Object.entries(value).map(([subKey, subValue]) => (
              <Fragment key={subKey}>
                <dt>{subKey}</dt>
                <dd>{renderValue(subValue, subKey)}</dd>
              </Fragment>
            ))}
          </dl>
        );
      }
    } else {
      return <span className={key}>{String(value)}</span>;
    }
  };

  return renderValue(data);
};

const Page = () => {
  return (
    <article>
      <h2>Tools</h2>
      <dl>
        {Object.entries(tools).map(([key, { descriptor }]) => (
          <>
            <dt>{key}</dt>
            <dd>
              <details>
                <summary></summary>
                <JsonToHtmlMapper data={descriptor} />
              </details>
            </dd>
          </>
        ))}
      </dl>
    </article>
  );
};
export default Page;
