export type TimeStamped = any & {
  timestamp: number;
};

const descending = (a: TimeStamped, b: TimeStamped) => {
  return b.timestamp - a.timestamp;
};
const ascending = (a: TimeStamped, b: TimeStamped) => {
  return a.timestamp - b.timestamp;
};

const sortOnTimestamp = (array: TimeStamped[] = [], asc = false) => {
  return array.toSorted(asc ? ascending : descending);
};
export default sortOnTimestamp;
