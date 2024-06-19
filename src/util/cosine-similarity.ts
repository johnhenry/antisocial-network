import dotProduct from "@/util/dot-product";
import norm from "@/util/norm";
const cosineSimilarity = (vectorA: number[], vectorB: number[]) =>
  dotProduct(vectorA, vectorB) / (norm(vectorA) * norm(vectorB));
export default cosineSimilarity;
