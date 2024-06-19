const norm = (vector: number[]) => {
  return Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
};
export default norm;
