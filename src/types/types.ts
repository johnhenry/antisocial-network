export type Agent = {
  id: string;
  timestamp: string;
  name: string;
  description: string;
  content: string;
  hash: string;
  embedding: number[];
  qualities: [string, string][];
  combinedQualities: string;
  model: Record<string, any>;
  image: string;
  indexed: string;
};
export type Meme = {
  id: string;
  timestamp: string;
  content: string;
  hash: string;
  embedding: number[];
};
export type File = {
  id: string;
  timestamp: string;
  content: string;
  hash: string;
  type: string;
  data: BinaryData;
  embedding: number[];
  publisher: string | null;
  publishDate: string | null;
  name: string | null;
};
