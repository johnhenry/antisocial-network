const Page = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  return (
    <section>
      <h2>Doc:{identifier}</h2>
    </section>
  );
};
export default Page;
