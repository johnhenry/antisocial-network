import type { Tool } from "@/types/tools";

declare module "sanitize-html" {
  // Adjust the parameter and return types based on the actual implementation
  export default function (string): string;
}

declare module "markdown-it" {
  // Adjust the parameter and return types based on the actual implementation
  type Thing = {
    linkify: { set: (o: object) => void };
    render: (s: string) => string;
  };

  export default function (formRef: {
    linkify: boolean;
    typographer: boolean;
  }): Thing;
}

declare module "surreal.js" {
  // Adjust the parameter and return types based on the actual implementation
  export default function (formRef: HTMLFormElement): Promise<object>;
}

declare module "@/tools/descriptors" {
  import { RegisteredDescriptor } from "@/types/tools";
  // declare const tools: { [key: string]: Tool };
  // export = tools;
  export default Record<string, RegisteredDescriptor>;
}

declare module "@jest/globals" {
  export default any;
}
declare module "@/lib/tools/mod" {
  import type { Tool } from "@/lib/tools/mod";
  export default Record<string, any>;
}
