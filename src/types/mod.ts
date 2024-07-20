import type { BaseMessageChunk } from "@langchain/core/messages";
import type { RecordId } from "surrealdb.js";

export type Post = {
  id: RecordId;
  timestamp: number;
  embedding: number[];
  files?: File[];
  mentions?: Agent[];
  content?: string;
  count?: number;
  hash?: string;
  target?: Post;
  source?: Agent;
  container?: File;
  bibliography?: Post[];
  tools?: string[]; // match:/\w[\w:-]*\w/
};

export type PostExt =
  & Omit<
    Post,
    | "id"
    | "embedding"
    | "files"
    | "mentions"
    | "target"
    | "source"
    | "container"
    | "bibliography"
  >
  & {
    id: string; // e.g. post:i24y4ossr9er, post:aew482kngs9
    files?: FileExt[];
    mentions?: AgentExt[];
    target?: PostExt;
    source?: AgentExt;
    container?: FileExt;
    bibliography?: PostExt[];
  }; // content for PostEx is a textual summary of the content

export type Agent = {
  id: RecordId;
  timestamp: number;
  name: string; // match:/\w[\w:-]*\w/
  description: string;
  content: string;
  count: number;
  hash: string;
  embedding: number[];
  qualities: [string, string][];
  combinedQualities?: string;
  parameters: AgentParameters;
  image?: string;
  indexed?: string;
};

// Agent with only: id, name, and embedding
export type AgentTemp = Omit<
  Agent,
  | "timestamp"
  | "description"
  | "content"
  | "count"
  | "hash"
  | "qualities"
  | "parameters"
>;

export type AgentExt = Omit<Agent, "id" | "embedding"> & {
  id: string; // e.g. agent:6yweoaerserosr, agent:9nlanlj9adf
};

export type File = {
  id: RecordId;
  timestamp: number;
  content: string;
  count: number;
  hash: string;
  type: string; // e.g image/jpeg, application/json
  embedding: number[];
  author?: string;
  publisher?: string;
  date?: string;
  name?: string;
  owner?: Agent;
};

export type FileExt = Omit<File, "id" | "embedding" | "data" | "owner"> & {
  id: string; // e.g. file:y24ros245ser, file:nl6d3anlj9adff
  owner?: AgentExt;
};

export type FileProto = Omit<
  File,
  | "id"
  | "timestamp"
  | "embedding"
  | "data"
  | "hash"
  | "data"
  | "embedding"
  | "count"
>;

export type AgentParameters = {
  embeddingOnly?: boolean;
  // f16KV?: boolean;
  frequencyPenalty?: number;
  headers?: Record<string, string>; // need time to plan this out
  keepAlive?: string | number; // need to plan this out more
  logitsAll?: boolean;
  lowVram?: boolean;
  mainGpu?: number;
  model?: string;
  baseUrl?: string; // will not do
  mirostat?: number;
  mirostatEta?: number;
  mirostatTau?: number;
  maxTokens?: number; // TODO: was this here before? Did I delete it on purpose?
  numBatch?: number;
  numCtx?: number;
  numGpu?: number;
  numGqa?: number;
  numKeep?: number;
  numPredict?: number;
  numThread?: number;
  penalizeNewline?: boolean;
  presencePenalty?: number;
  repeatLastN?: number;
  repeatPenalty?: number;
  ropeFrequencyBase?: number;
  ropeFrequencyScale?: number;
  temperature?: number;
  stop?: string[]; // need time to plan this out
  tfsZ?: number;
  topK?: number;
  topP?: number;
  typicalP?: number;
  useMLock?: boolean;
  useMMap?: boolean;
  vocabOnly?: boolean;
  format?: "json";
};

export type Relationship = {
  table: string;
  relationship: string;
  results: any[];
};

export type Setting = {
  id?: string | RecordId;
  name: string;
  label: string;
  type: string;
  defaultValue?: string;
  options?: string[];
};

export type Settings = {
  id: string;
  settings: Setting[];
};

export type LangchainGenerator = AsyncGenerator<
  BaseMessageChunk,
  void,
  unknown
>;

export type Log = {
  id: RecordId;
  timestamp: number;
  content: string;
  metadata?: JSON;
};

export type LogExt = Omit<Log, "id"> & {
  id: string; // e.g. log:9y4o5sersr, log:9nlanlj9ad
};
