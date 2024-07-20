import * as Minio from "minio";
import stream from "stream";

import {
  FS_ACCESS_KEY,
  FS_BUCKET,
  FS_ENDPOINT,
  FS_PORT,
  FS_SECRET_KEY,
} from "@/config/mod";

export const putObject = async (
  buff: Uint8Array,
  { id }: { id: string },
) => {
  // Instantiate the MinIO client with the object store service
  // endpoint and an authorized user's credentials
  // play.min.io is the MinIO public test cluster
  const minioClient = new Minio.Client({
    endPoint: FS_ENDPOINT,
    port: FS_PORT,
    useSSL: false,
    accessKey: FS_ACCESS_KEY,
    secretKey: FS_SECRET_KEY,
  });
  // Create a readable stream from the buffer
  const readableStream = new stream.PassThrough();
  readableStream.end(Buffer.from(buff));
  const exists = await minioClient.bucketExists(FS_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(FS_BUCKET, "us-east-1");
  }
  await minioClient.putObject(
    FS_BUCKET,
    id,
    readableStream,
  );
};
