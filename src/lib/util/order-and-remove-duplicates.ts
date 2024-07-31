import type { HasId, HasTimestamp } from "@/types/misc";

export const removeDuplicatesById = (items: HasId[]) => {
  const ids = new Set();
  return items.filter((item) => {
    if (ids.has(item.id)) {
      return false;
    } else {
      ids.add(item.id);
      return true;
    }
  });
};

export const orderByTimestamp = (items: HasTimestamp[]) => {
  return items.sort((a, b) => b.timestamp - a.timestamp);
};

export const orderByTimestampAndRemoveDuplicates = (items:(HasId & HasTimestamp)[]) =>
  orderByTimestamp(removeDuplicatesById(items));

export default orderByTimestampAndRemoveDuplicates;
