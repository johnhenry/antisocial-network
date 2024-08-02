type Dropoff = {
  index: number;
  dropoff: number;
};

const findSignificantDropoffs = (dropoffs: Dropoff[], zScoreThreshold = 2) => {
  const mean = dropoffs.reduce((sum, d) => sum + d.dropoff, 0) /
    dropoffs.length;
  const stdDev = Math.sqrt(
    dropoffs.reduce((sum, d) => sum + Math.pow(d.dropoff - mean, 2), 0) /
      dropoffs.length,
  );

  return dropoffs.filter((d) => (d.dropoff - mean) / stdDev > zScoreThreshold)
    .map((d) => d.index)
    .sort((a, b) => a - b);
};
export default findSignificantDropoffs;

// // JavaScript version using TensorFlow.js
// import * as tf from '@tensorflow/tfjs';

// const findSignificantDropoffs = (dropoffs, zScoreThreshold = 2) => {
//     const dropoffValues = dropoffs.map(d => d.dropoff);
//     const dropoffTensor = tf.tensor1d(dropoffValues);

//     const mean = tf.mean(dropoffTensor);
//     const stdDev = tf.sqrt(tf.mean(tf.square(tf.sub(dropoffTensor, mean))));

//     const zScores = tf.div(tf.sub(dropoffTensor, mean), stdDev);
//     const significantMask = tf.greater(zScores, zScoreThreshold);

//     const significantIndices = tf.whereAsync(significantMask);

//     return significantIndices.array().then(indices =>
//         indices.map(([index]) => dropoffs[index].index).sort((a, b) => a - b)
//     );
// };
