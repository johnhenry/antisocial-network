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
export interface Tool {
  descriptor: Descriptor;
  handler: Handler;
}
