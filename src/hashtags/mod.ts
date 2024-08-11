import type { DescriptorFull } from "@/hashtags/types";

import descriptorsByKey from "@/hashtags/descriptors/mod";
import handlersByKey from "@/hashtags/handlers/mod";

const FullDescriptors: Record<string, DescriptorFull> = {};
for (const [k, descriptor] of Object.entries(descriptorsByKey)) {
  const handler = handlersByKey[k];
  if (Array.isArray(descriptor.name)) {
    for (const name of descriptor.name) {
      FullDescriptors[name] = {
        ...descriptor,
        name,
        handler,
      } as DescriptorFull;
    }
  } else {
    FullDescriptors[descriptor.name] = {
      ...descriptor,
      handler,
    } as DescriptorFull;
  }
}

export default FullDescriptors;
