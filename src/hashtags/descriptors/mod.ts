import type { Descriptor, DescriptorSingleName } from "@/hashtags/types";
import advancedPrompting from "@/hashtags/plugins/ap/descriptor";
import tools from "@/hashtags/plugins/tl/descriptor";
const descriptors: Record<string, Descriptor> = { advancedPrompting, tools };
export const descriptorsByName: Record<string, DescriptorSingleName> = {};
for (const [_, descriptor] of Object.entries(descriptors)) {
  if (Array.isArray(descriptor.name)) {
    for (const name of descriptor.name) {
      descriptorsByName[name] = { ...descriptor, name };
    }
  } else {
    descriptorsByName[descriptor.name] = {
      ...descriptor,
    } as DescriptorSingleName;
  }
}
export default descriptors;
