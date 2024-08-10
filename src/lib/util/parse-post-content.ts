import { Agent } from "@/types/mod";
import { recordMatch } from "@/lib/util/match";
import { getDB } from "@/lib/db";
import { replaceAndAccumulate } from "@/lib/util/replace-mentions";
import replaceMentions from "@/lib/util/replace-mentions";
import { TABLE_AGENT } from "@/config/mod";
import { createTempAgent } from "@/lib/database/agent";
import { StringRecordId } from "surrealdb.js";
import { getAgent } from "@/lib/database/agent";

const getAgentIdByNameOrCreate = async (
  name: string,
  context: string = name,
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
    return (agent ||
      (await createTempAgent({ name, context }))) as Agent;
  } finally {
    await db.close();
  }
};

const replaceAgents = async (
  name: string,
  context: string = name,
): Promise<string | [string, any]> => {
  if (recordMatch.test(name)) {
    if (name.startsWith("@agent:")) {
      const agent = await getAgent(new StringRecordId(name.slice(1)));
      return [name, agent];
    }
    return name;
  }
  if (name[0] === "@") {
    const agent = await getAgentIdByNameOrCreate(name.slice(1), context);
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
    replaceAndAccumulate((x) => replaceAgents(x, content), mentions),
  );
  return updatedContent;
};

export default parsePostContent;
