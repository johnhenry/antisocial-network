import dotProduct from "@/lib/util/dot-product";
import norm from "@/lib/util/norm";
const cosineSimilarity = (vectorA: number[], vectorB: number[]) =>
  dotProduct(vectorA, vectorB) / (norm(vectorA) * norm(vectorB));

// import * as tf from "@tensorflow/tfjs";

// const cosineSimilarity = (a: number[], b: number[]) => {
//   const aTensor = tf.tensor(a);
//   const bTensor = tf.tensor(b);
//   const dotProduct = tf.sum(tf.mul(aTensor, bTensor));
//   const magnitudeA = tf.sqrt(tf.sum(tf.square(aTensor)));
//   const magnitudeB = tf.sqrt(tf.sum(tf.square(bTensor)));
//   return dotProduct.div(magnitudeA.mul(magnitudeB)).dataSync()[0];
// };
export default cosineSimilarity;
