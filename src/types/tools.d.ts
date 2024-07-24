import JSONObjectExtended from "@/types/json-extended";
export type Descriptor = JSONObjectExtended;
export type Handler = (args: any) => Promise<string>;
export interface Tool {
  descriptor: Descriptor;
  handler: Handler;
}
