import type { FileProto, Post } from "@/types/mod";
import { Forward } from "@/lib/util/forwards";

export type Descriptor = {
  name: string[] | string;
  description: string;
};
// export type Handler = (...args: any[]) => any | Promise<any>;
export type Handler = (CONTEXT: any) => AsyncGenerator<Post, void, unknown>;
export type DescriptorSingleName = {
  name: string;
  description: string;
};

export type DescriptorFull = Descriptor & { handler: Handler; name: string };
