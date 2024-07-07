// import linkifyHtml from "linkify-html";
import sanitizeHtml from "sanitize-html";
import markdownit from "markdown-it";
const md = markdownit({
  linkify: true,
  typographer: true,
});
md.linkify.set({ fuzzyEmail: false });
const renderText = async (
  str: string,
) => {
  return sanitizeHtml(
    md
      .render(str)
      .replace(/^<p>|<\/p>$/g, "").replaceAll("<p></p>", ""), //https://stackoverflow.com/a/28583815/1290781; TODO: I don' think that first .replaceAll does anything? I think the secon one matters
  ).replaceAll("<p></p>", "");
};
export default renderText;
