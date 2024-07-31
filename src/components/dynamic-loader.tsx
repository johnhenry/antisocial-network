import dynamic from "next/dynamic";
const QuoteCycler = dynamic(() => import("@/components/quote-cycler"), {
  ssr: false,
});

const DynamicLoader = () => {
  return (
    <article className="loader">
      <QuoteCycler random className="quote-cycler" />
    </article>
  );
};

export default DynamicLoader;
