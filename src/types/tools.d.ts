
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
export type RegisteredDescriptor = Descriptor & { description: string, name:string };
export type Handler = ((args: any) => Promise<string> | string) & ({ name?: string });
export type Tool = RegisteredDescriptor &  {
  handler: Handler;
}
