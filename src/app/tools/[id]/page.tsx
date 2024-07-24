import type { FC } from "react";

type ToolPageParams = {
  params: { id?: string };
};

const Page: FC<ToolPageParams> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  return (
    <article>
      <h2>Tool:{identifier}</h2>
    </article>
  );
};
export default Page;
