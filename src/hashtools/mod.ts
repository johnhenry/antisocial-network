import type { DescriptorFull } from "@/hashtools/types";

import descriptorsByKey from "@/hashtools/descriptors/mod";
import handlersByKey from "@/hashtools/handlers/mod";

const FullDescriptors: Record<string, DescriptorFull> = {};
for (const [k, descriptor] of Object.entries(descriptorsByKey)) {
  const handler = handlersByKey[k];
  if(Array.isArray(descriptor.name)) {
    for(const name of descriptor.name) {
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
