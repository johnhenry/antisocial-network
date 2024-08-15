// import ffmpeg from "fluent-ffmpeg";
// import { PassThrough, Readable } from "stream";

// export const extract = (videoStream: Readable, offset: number = 0) => {
//   return new Promise((resolve, reject) => {
//     let data = Buffer.alloc(0);
//     const imageStream = new PassThrough();

//     imageStream.on("data", (chunk) => {
//       // Add chunk to data structure
//       data = Buffer.concat([data, chunk]);
//     });

//     imageStream.on("error", (error) => {
//       reject(error);
//     });

//     imageStream.on("end", () => {
//       // Final data is the combined buffer
//       resolve(data);
//     });

//     ffmpeg(videoStream)
//       .inputOptions([
//         "-ss",
//         offset / 1000,
//         "-noaccurate_seek",
//       ])
//       .outputOptions([
//         "-vframes",
//         1,
//         "-q:v",
//         "2",
//       ])
//       .output(imageStream)
//       .run();
//   });
// };
