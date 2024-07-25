export const removeDeplicatesById = (items: HasId[]) => {
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

export const orderByTimestampAndRemoveDuplicates = (items) =>
  orderByTimestamp(removeDeplicatesById(items));

export default orderByTimestampAndRemoveDuplicates;
