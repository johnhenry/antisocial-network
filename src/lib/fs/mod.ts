import * as Minio from "minio";
import stream from "stream";

import {
  FS_ACCESS_KEY,
  FS_BUCKET,
  FS_HOSTNAME,
  FS_PORT,
  FS_PROTOCOL,
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
    endPoint: FS_HOSTNAME,
    port: Number(FS_PORT),
    useSSL: FS_PROTOCOL === "https:",
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

export const getObject = async (
  id: string,
  offset?: number,
  length?: number,
) => {
  const minioClient = new Minio.Client({
    endPoint: FS_HOSTNAME,
    port: Number(FS_PORT),
    useSSL: false,
    accessKey: FS_ACCESS_KEY,
    secretKey: FS_SECRET_KEY,
  });

  if (typeof offset === "number") {
    const stream = minioClient.getPartialObject(
      FS_BUCKET,
      id,
      offset,
      length,
    );
    return stream;
  }
  const stream = minioClient.getObject(FS_BUCKET, id);
  return stream;
};

export const getObjectFull = async (
  id: string,
  transform?: (chunk: Buffer) => Buffer | Promise<Buffer>,
): Promise<Buffer> => {
  const result: Buffer = await new Promise(async (resolve, reject) => {
    const minioClient = new Minio.Client({
      endPoint: FS_HOSTNAME,
      port: Number(FS_PORT),
      useSSL: false,
      accessKey: FS_ACCESS_KEY,
      secretKey: FS_SECRET_KEY,
    });

    const stream = await minioClient.getObject(FS_BUCKET, id);
    let temp = Buffer.alloc(0); // Initializing as an empty buffer

    stream.on("data", (chunk: Buffer) => {
      temp = Buffer.concat([temp, chunk]); // Appending each chunk to temp
    });

    stream.on("error", reject);

    stream.on("end", () => {
      resolve(temp); // Resolving with the final concatenated buffer
    });
  });
  if (typeof transform !== "function") {
    return result;
  }
  return transform(result);
};
