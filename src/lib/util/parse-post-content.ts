import { Agent, AgentTemp } from "@/types/mod";
import { recordMatch } from "@/lib/util/match";
import { getDB } from "@/lib/db";
import { replaceAndAccumulate } from "@/lib/util/replace-mentions";
import replaceMentions from "@/lib/util/replace-mentions";
import { TABLE_AGENT } from "@/config/mod";
import { createTempAgent } from "@/lib/database/agent";

const getAgentIdByNameOrCreate = async (
  name: string,
): Promise<Agent> => {
  const db = await getDB();
  try {
    const [[agent]]: [[Agent]] = await db.query(
      "SELECT * FROM type::table($table) WHERE name = $name",
      {
        table: TABLE_AGENT,
        name,
      },
    );
    return (agent || (await createTempAgent({ name })));
  } finally {
    await db.close();
  }
};

const replaceAgents = async (name: string): Promise<string | [string, any]> => {
  if (recordMatch.test(name)) {
    return name;
  }
  if (name[0] === "@") {
    const agent = await getAgentIdByNameOrCreate(name.slice(1));
    const id = `@${agent.id.toString()}`;
    return [id, agent];
  }
  return name;
};

const parsePostContent = async (
  content: string,
  mentions: (string | [string, Agent])[],
): Promise<string> => {
  const updatedContent = await replaceMentions(
    content,
    replaceAndAccumulate(replaceAgents, mentions),
  );
  return updatedContent;
};

export default parsePostContent;
