export type File = {
  timestamp: string;
  id: string;
  content: string;
};

export type Post = {
  id: string;
  timestamp: string;
  user_id: string;
  parent_id: string;
  content: string;
  attachments: File[];
  children: Post[];
};
