/**
 * Converts a File object to a base64 string.
 * @param file - The File object to convert.
 * @returns A Promise that resolves to the base64 string representation of the file.
 */
import type { FileProto } from "@/types/mod";

const fileToBase64 = (file: FileProto | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file as File);
  });
};
export default fileToBase64;
