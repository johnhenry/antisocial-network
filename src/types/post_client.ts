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
};

export type Agent = {
  id: string;
  timestamp: string;
  name: string;
  generatedDescription: string;
  description: string;
  qualities: [string, string][];
  systemPrompt: string;
  model: string;
  image: string;
};
