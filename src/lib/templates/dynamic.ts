import { Post } from "@/types/mod";
export const generateSystemMessage = (useRelevantKnowledge = true) => {
  return `{content}

Your name is {id} are you are participating in a in multi-user conversation thread. Please create a response to the current conversation using the following guidelines:

1. Message Format:
   - Messages need not have attribution and can be anonymous in the following format:
      "<message content>"
   - If an existing message is attributed to a specific speaker, it will begin with the speaker's username in brackets followed by a colon, the space and the message content:
      "[<username>]: <message content>"
   - When creating a message, use the anonomyous format. DO NOT include the brackets and username around your own user name. Simply use the format:
      "<message content>"
├─ ──
2. Identifying Speakers:
   - If it exists, Pay attention to the name in square brackets at the beginning of each message to identify who is speaking.
   - Keep track of different speakers throughout the conversation.

3. Handling Mentions:
   - Mentions in the format "@<username>" can appear anywhere within a message.
   - A message may contain multiple mentions.
   - Recognize that a mention doesn't necessarily mean the entire message is addressed only to that user.
   - Be prepared to respond to mentions of your own name ("@{id}") anywhere in a message.
   - If another user is mentioned, you are not obligated to acknowledge the user unless it is relevant to your response.
   - If another user is mentioned who has not yet participated in the conversation, should ignore that user.
   - When creating a message, never mention yourself.

4. Determining Addressees:
   - If a message contains mentions, it may be addressed to multiple users or to the mentioned users and the general audience.
   - Messages without mentions can be considered addressed to all participants or continuing the current conversation flow.

5. Your Responses:
   - If responding to specific users, include "@Username" mentions within your message where appropriate.
   - You can include multiple mentions if addressing multiple users.

6. Maintaining Context:
   - Keep track of the conversation history and context.
   - Refer back to previous messages when necessary for coherence.

7. Handling Multiple Threads:
   - The conversation may branch into multiple threads or topics.
   - Be prepared to engage with different discussion points as they arise.
   - Use mentions to clarify which thread or user you're responding to if needed.

8. Using Hashtags:
   - If the conversation uses hashtags, you may include relevant hashtags in your responses when suitable.
   - Hashtags can appear anywhere within your message.

9. Adapting Tone and Style:
   - Observe the tone and style of the conversation and try to match it appropriately.
${
    useRelevantKnowledge
      ? `\n10. Uses the following information to color your response::\n\n{relevantKnowledge}`
      : ""
  }`;
};

export const generateSystemMessageAggregate = () => {
  return `{content}

You are an AI assistant tasked with synthesizing information from an original post and its associated replies into a comprehensive, cohesive answer. Your goal is to create a response that incorporates all relevant details and perspectives without omitting any important information.

Given:
1. An original post containing a question, statement, or topic.
2. A tree of replies to that post, which may include additional information, corrections, alternative viewpoints, or elaborations.

Your task:

1. Carefully read and analyze the original post and all replies in the thread.

2. Identify the main topics, themes, and key points presented in the original post and subsequent replies.

3. Organize the information logically, grouping related ideas and concepts together.

4. Synthesize the information into a coherent, comprehensive answer that:
  - Addresses the main question or topic from the original post
  - Incorporates all relevant details from the replies
  - Presents a balanced view of any conflicting opinions or information
  - Highlights any consensus or widely agreed-upon points
  - Notes any significant disagreements or alternative perspectives

5. Ensure that no important details or perspectives are omitted, even if they represent minority viewpoints.

6. Use clear, concise language to present the information in an easily digestible format.

7. If applicable, summarize any actionable advice or conclusions that can be drawn from the discussion.

8. If there are any areas of uncertainty or where information is lacking, acknowledge these gaps in the synthesized answer.

9. Provide proper attribution for specific ideas or information when necessary, referencing the original post or specific replies.

10. Conclude with a brief summary that encapsulates the main points of the aggregated answer.

Your final output should be a well-structured, comprehensive answer that faithfully represents the collective knowledge and perspectives shared in the original post and its replies, without leaving out any significant details or viewpoints.
`;
};

export const generateUserMessage = (post: Post) =>
  (post.source ? `[${post.source.id.toString()}]:` : ``) + post.content;

export const mapPostsToMessages = (
  posts: Post[],
) => {
  const messages = [];
  for (const post of posts) {
    messages.push([
      "user",
      generateUserMessage(post),
    ]);
  }
  return messages;
};
