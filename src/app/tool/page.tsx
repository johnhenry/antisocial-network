import * as tools from "@/tools";

const Page = () => {
  return (
    <section>
      <h2>Tools</h2>
      <dl>
        {Object.entries(tools).map(([key, { descriptor }]) => (
          <>
            <dt>{key}</dt>
            <dd>
              <pre>{JSON.stringify(descriptor, null, " ")}</pre>
            </dd>
          </>
        ))}
      </dl>
    </section>
  );
};
export default Page;
