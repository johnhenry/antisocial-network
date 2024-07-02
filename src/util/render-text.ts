// import linkifyHtml from "linkify-html";
import sanitizeHtml from "sanitize-html";
import markdownit from "markdown-it";
import replaceMentions from "@/util/replace-mentions";
import type { MentionCallback } from "@/util/replace-mentions";
const md = markdownit({
  linkify: true,
  typographer: true,
});
md.linkify.set({ fuzzyEmail: false });

const renderText = async (
  str: string,
  replacer: MentionCallback,
) => {
  return sanitizeHtml(
    md
      .render(
        await replaceMentions(str, replacer),
      )
      .replace(/^<p>|<\/p>$/g, "").replaceAll("<p></p>", ""), //https://stackoverflow.com/a/28583815/1290781
  ).replaceAll("<p></p>", "");
};

export default renderText;
