import dotProduct from "@/lib/util/dot-product";
import norm from "@/lib/util/norm";
const cosineSimilarity = (vectorA: number[], vectorB: number[]) =>
  dotProduct(vectorA, vectorB) / (norm(vectorA) * norm(vectorB));
export default cosineSimilarity;
