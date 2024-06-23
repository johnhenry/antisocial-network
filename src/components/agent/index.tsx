import Image from "next/image";

import truncate from "@/util/truncate-string";

const AgentRenderer = ({ agent }: { agent: any }) => {
  const truncatedPrompt = truncate(agent.systemPrompt, 80);
  return (
    <>
      <header>
        <Image
          src={agent.image ? agent.image : "/static/user.webp"}
          alt={agent.name}
          width={100}
          height={100}
        />
      </header>
      <main>
        <span>{agent.name}</span>
        <p title={agent.indexed}>{truncatedPrompt}</p>
      </main>
    </>
  );
};
export default AgentRenderer;
