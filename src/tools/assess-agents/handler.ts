import type { Handler } from "@/types/tools";

const handler: Handler = async ({
  scores,
}: {
  scores: { agent: string; score: number }[];
}): Promise<string> => {
  return "0";
};

export default handler;
