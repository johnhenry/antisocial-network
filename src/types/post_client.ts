export type File = {
  timestamp: string;
  id: string;
  content: string;
  path: string;
  type: string;
};

export type Post = {
  id: string;
  timestamp: string;
  user_id: string;
  parent_id: string;
  content: string;
  attachments: File[];
  children: Post[];
  agent?: Agent;
  hash: string;
};

export type Agent = {
  id: string;
  timestamp: string;
  name: string;
  systemPrompt: string;
  description: string;
  combinedQualities: string;
  qualities: [string, string][];
  model: string;
  image: string;
  indexed: string;
};

export type Meme = {
  id: string;
  timestamp: string;
  embedding: number[];
  hash: string;
  content: string;
};

export type Doc = {
  id: string;
  timestamp: string;
  title: string | null;
  author: string | null;
  publisher: string | null;
  publisherDate: string | null;
};
