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
  {
    mentions,
    hashtags,
  }: { mentions?: MentionCallback; hashtags?: MentionCallback } = {}
) => {
  return sanitizeHtml(
    md
      .render(
        await replaceMentions(
          await replaceMentions(str, mentions, "@"),
          hashtags,
          "#"
        )
      )
      .replace(/^<p>|<\/p>$/g, "") //https://stackoverflow.com/a/28583815/1290781
  );
};

export default renderText;
