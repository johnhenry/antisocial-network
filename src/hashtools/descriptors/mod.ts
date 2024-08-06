import type { Descriptor } from "@/hashtools/types";
import mixtureOfAgents from "@/hashtools/plugins/moa/descriptor";
const descriptors: Record<string, Descriptor> = { mixtureOfAgents };

export const descriptorsByName:Record<string, Descriptor> = {};
for(const [id, descriptor] of Object.entries(descriptors)) {
  if(Array.isArray(descriptor.name)) {
    for(const name of descriptor.name) {
      descriptorsByName[name] = {...descriptor, name};
    }
  }else{
    descriptorsByName[descriptor.name] = {...descriptor};
  }
}
export default descriptors;
