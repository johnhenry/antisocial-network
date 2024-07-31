export const vectorSum2 = (vector: number[], vectorB: number[]): number[] => {
  return vector.map((value, index) => value + vectorB[index]);
};
export const vectorSum = (vectors: number[][]): number[] => {
  return vectors.reduce(vectorSum2);
};
export default vectorSum;
