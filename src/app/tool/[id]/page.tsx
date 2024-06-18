const Page = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  return (
    <section>
      <h2>Tool:{identifier}</h2>
    </section>
  );
};
export default Page;
