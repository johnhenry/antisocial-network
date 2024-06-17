export type TimeStamped = any & {
  timestamp: string;
};

// export interface TimeStamped  {
//   timestamp: string;
// }

const descending = (a: TimeStamped, b: TimeStamped) => {
  return Number(new Date(b.timestamp)) - Number(new Date(a.timestamp));
};
const ascending = (a: TimeStamped, b: TimeStamped) => {
  return Number(new Date(a.timestamp)) - Number(new Date(b.timestamp));
};

const sortOnTimestamp = (array: TimeStamped[] = [], asc = false) => {
  return array.toSorted(asc ? ascending : descending);
};
export default sortOnTimestamp;
