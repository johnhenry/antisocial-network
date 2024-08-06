import type { FileProto, Post } from "@/types/mod";
import { Forward } from "@/lib/util/forwards";

export type Descriptor = {
  name: string[] | string;
  description: string;
};
export type Handler = (...args: any[]) => Promise<{
  post?: Post;
  dehydrated?: string;
  simultaneous: Forward[] | undefined;
  files?: FileProto[];
}>;
export type DescriptorSingleName = {
  name: string;
  description: string;
};

export type DescriptorFull = Descriptor & { handler: Handler; name: string };
