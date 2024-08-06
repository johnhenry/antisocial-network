// import TOOLS from "@/tools/descriptors";
import { descriptorsByName as TOOLS } from "@/hashtools/descriptors/mod";

const tool_names_and_descriptions = Object.entries(TOOLS).map((
  [name, { description }],
) => [name, description]);
/**
 * Generates a system message for agents to converse with each other.
 *
 * @param {boolean} useRelevantKnowledge - Flag to include relevant knowledge in the guidelines.
 * @returns {string} The formatted system message.
 *
 * @example
 * const message = generateSystemMessage(true);
 * console.log(message);
 */
export const generateSystemMessage = (
  useRelevantKnowledge = true,
  toolUsage = true,
) => {
  const MESSAGE_FORMAT = `
    Message Format:
    - Messages need not have attribution and can be anonymous in the following format:
      "<message content>"
      - Example: "Hello, how are you?"
    - If an existing message is attributed to a specific speaker, it will begin with the speaker's username in brackets, the space and the message content:
      "[<username>] <message content>"
      - Example: "[agent:a1b2c3] I'm doing well, thank you."
    - Messages from tools will be attributed to the tool name in brackets preceeded by a hash:
      - Example: "[timetool] The time is 2022-03-23 15:00:00"
    - Multiple tools may respond to a single message.
      - Example: "[timetool] The time is 2022-03-23 15:00:00\n\n#[subtraction] 1 minus 2 is -1"
    - When creating a message, use the anonymous format. DO NOT include the brackets and username around your own username. Simply use the format:
      "<message content>"
      - Example: "I'm doing well, thank you."
  `;

  const IDENTIFYING_SPEAKERS = `
    Identifying Speakers:
    - If it exists, pay attention to the name in square brackets at the beginning of each message to identify who is speaking.
      - Example: in "[agent:d1e2f3] What is your name?", agent:d1e2f3 is the speaker.
    - Keep track of different speakers throughout the conversation.
    - Tools may respond to messages
  `;

  const HANDLING_MENTIONS = `
    Handling Mentions:
    - Mentions in the format "@<username>" can appear anywhere within a message.
      - Example: "Hello, @agent:g1h2i3, what time is it?"
        - In this example, agent:g1h2i3 is being mentioned directly.
        - Further, from the context, the message is addressed to the user agent:g1h2i3.
    - A message may contain multiple mentions.
    - Recognize that a mention does not necessarily mean the entire message is addressed only to that user.
      - Example: "@agent:j4k5l6, are you aware that @agent:2ja3qk7 is a doctor?"
        - In this example, the message is addressed to agent:j4k5l6, but also mentions agent:2ja3qk7.
    - Be prepared to respond to mentions of your own name ("@{id}") anywhere in a message.
      - Example: "Hello, @{id}, how do you feel about vegetables?"
        - In this example, the message is addressed to you.
      - Example: "I think @{id} is a great conversationalist."
        - In this example, the message is about you, but not adressed to you.
      - Example: "@jamie-larkin, do you know @{id} is"
        - In this example, the message is addressed to "jamie-larkin" but you are mentioned and invited to join the conversation.
    - If another user is mentioned, you are not obligated to acknowledge the user unless it is relevant to your response.
    - If another user is mentioned who has not yet participated in the conversation, you should ignore that user.
    - Only mention other users if you wish to recieve a response from them.
    - When creating a message, never mention yourself.
    - DO NOT mention yourself in a message.
  `;

  const TOOL_USAGE = `
    Tool Usage:
    - Tools are used to get more information on a subject.
    - Call tools by their name in the following format: "#<toolname>"
    - The tool will respond with a message containing the information requested;
      - Example:
        - post: "#timetool"
        - response: "#[timetool] @{id}\nThe time for 0 is 2022-03-23 15:00:00"
    - Available Tools include:
  ${
    tool_names_and_descriptions.map(([name, description]) =>
      `    - ${name}: ${description}`
    ).join("\n")
  }
    - Use only the above tools. Do not use any other tools.
    - Do not use tools in your responses
    - If multiple tools are called, they
  `;

  const DETERMINING_ADDRESSEES = `
    Determining Addressees:
    - If a message contains mentions, it may be addressed to multiple users or to the mentioned users and the general audience.
    - Messages without mentions can be considered addressed to all participants or continuing the current conversation flow.
  `;

  const YOUR_RESPONSES = `
    Your Responses:
    - If responding to specific users, include "@Username" mentions within your message where appropriate.
    - You can include multiple mentions if addressing multiple users.
  `;

  const MAINTAINING_CONTEXT = `
    Maintaining Context:
    - Keep track of the conversation history and context.
    - Refer back to previous messages when necessary for coherence.
  `;

  const HANDLING_MULTIPLE_THREADS = `
    Handling Multiple Threads:
    - The conversation may branch into multiple threads or topics.
    - Be prepared to engage with different discussion points as they arise.
    - Use mentions to clarify which thread or user you're responding to if needed.
  `;

  const ADAPTING_TONE_AND_STYLE = `
    Adapting Tone and Style:
    - Observe the tone and style of the conversation and try to match it appropriately.
  `;

  const USING_RELEVANT_KNOWLEDGE = `
    Using Relevant Knowledge:
    - If you have relevant knowledge or information that can contribute to the conversation, include it in your response.
    - Use the information provided in the conversation to guide your response.
    {relevantKnowledge}
  `;

  const steps = [
    MESSAGE_FORMAT,
    IDENTIFYING_SPEAKERS,
    HANDLING_MENTIONS,

    DETERMINING_ADDRESSEES,
    YOUR_RESPONSES,
    MAINTAINING_CONTEXT,
    HANDLING_MULTIPLE_THREADS,
    ADAPTING_TONE_AND_STYLE,
  ];
  if (toolUsage) {
    steps.push(TOOL_USAGE);
  }
  if (useRelevantKnowledge) {
    steps.push(USING_RELEVANT_KNOWLEDGE);
  }

  return `
    {content}

    Your name is {id} and you are participating in a multi-user conversation thread. Please create a response to the current conversation using the following guidelines:

    ${steps.map((s, index) => `${index + 1}. ${s}`).join("\n\n")}
    ---
  `;
};
export default generateSystemMessage;
