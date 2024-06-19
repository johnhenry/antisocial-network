const dotProduct = (vector: number[], vectorB: number[]) =>
  vector.reduce((sum, value, index) => sum + value * vectorB[index], 0);
export default dotProduct;
