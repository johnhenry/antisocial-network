import { Handler } from "@/hashtools/types";
export const mixtureOfAgents: Handler = async (...args: any[]) => {
  console.log(args);
  throw new Error("MIXTURE OF AGENTS NOT IMPLEMENTED");
};
export default mixtureOfAgents;
