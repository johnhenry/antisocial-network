export type Agent = {
  id: string;
  timestamp: string;
  name: string;
  description: string;
  systemPrompt: string; // replace with "conent" for consistency in other tables
  hash: string;
  embedding: number[];
  qualities: [string, string][];
  combinedQualities: string;
  model: string; // replace with brain:a record {model="", temperature="", etc}
  image: string;
  indexed: string;
};

// agent -> internalizes -> meme
export type Meme = {
  id: string;
  timestamp: string;
  content: string;
  hash: string;
  embedding: number[];
};
// Deprecated in favor of Meme
export type Post = {
  id: string;
  timestamp: string;
  embedding: number[];
  hash: string;
  content: string;
  user_id: string; // remove in favor of agent -created-> meme/post
  parent_id: string; // remove in favor of meme/post -elicits-> meme/post
  attachments: File[];
  children: Post[]; // remove in favor of meme/post -elicits-> meme/post
  agent?: Agent;
};

// agent -> bookmarks -> file/doc
// meme/post -> includes -> file/doc
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

// Depracated in favor of File
export type Doc = {
  id: string;
  timestamp: string;
  title: string | null;
  author: string | null;
  publisher: string | null;
  publishDate: string | null;
  hash: string;
  type: string;
  metadata: Record<string, any>;
};
