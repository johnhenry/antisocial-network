
export type Descriptor = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      required: string[];
      properties: {
        [key: string]: {
          type: string;
          description: string;
          enum: string[] | undefined;
        };
      };
    };
  };
};
export type Handler = (args: any) => Promise<string> | string;
export type Tool = {
  descriptor: Descriptor;
  handler: Handler;
}
export type RegisteredTool = Tool & { description: string, name:string };
