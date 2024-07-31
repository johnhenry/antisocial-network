import type { BaseMessageChunk } from "@langchain/core/messages";
import type { RecordId } from "surrealdb.js";
// https://stackoverflow.com/a/54178819
import type { JSONExtendedObject } from "@/types/json-extended";
//https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredWith<T, K extends keyof T> =
  & Omit<T, K>
  & Required<Pick<T, K>>;

export type ErrorExt = {
  id: string;
  isError: true;
  name: string;
  content: string;
  cause?: unknown;
};

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
  bibliography?: Post[];
  tools?: string[]; // match:/\w[\w:-]*\w/
};

export type PostPlus = {
  post: Post;
  before?: Post;
  after?: Post;
  elicits?: Post[];
  remembers?: Agent[];
  container?: File;
};

export type PostPlusExt = {
  post: PostExt;
  before?: PostExt;
  after?: PostExt;
  elicits?: PostExt[];
  remembers?: AgentExt[];
  container?: FileExt;
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
  lastupdated?: number;
  metadata?: Record<string, any>;
};

export type AgentPlus = {
  agent: Agent;
  remembered?: Post[];
  bookmarked?: File[];
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
  | "parameterfs"
>;

export type AgentExt = Omit<Agent, "id" | "embedding"> & {
  id: string; // e.g. agent:6yweoaerserosr, agent:9nlanlj9adf
};

export type AgentPlusExt = {
  agent: AgentExt;
  remembered?: PostExt[];
  bookmarked?: FileExt[];
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
  metadata?: Record<string, any>;
};

export type FilePlus = {
  file: File;
  bookmarkers?: Agent[];
  excerpt?: Post;
};
export type FilePlusExt = {
  file: FileExt;
  bookmarkers?: AgentExt[];
  excerpt?: PostExt;
};

export type FileExt = Omit<File, "id" | "embedding" | "data" | "owner"> & {
  id: string; // e.g. file:y24ros245ser, file:nl6d3anlj9adff
  owner?: AgentExt;
};

export type Entity = Agent | AgentTemp | File | Post | Log | Cron | Error;
// `Error is a built in type`
// AgentTemp will becaome AgentExt
export type EntityExt =
  | AgentExt
  | FileExt
  | PostExt
  | CronExt
  | LogExt
  | ErrorExt;

export type EntToExt =
  | ((entity: Agent) => AgentExt)
  | ((entity: File) => FileExt)
  | ((entity: Post) => PostExt);

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

export type RecordIdEphemeral = {
  tb: string;
  id: "";
  toString: () => string;
};

export type Log = {
  id: RecordId | RecordIdEphemeral;
  timestamp: number;
  target: string; // TODO: change to entity...maybe?
  type: string;
  content: string;
  metadata?: JSONExtendedObject;
};

export type LogExt = Omit<Log, "id"> & {
  id: string; // e.g. log:9y4o5sersr, log:9nlanlj9ad
};

export type Relation = {
  id: RecordId;
  in: RecordId;
  out: RecordId;
  data?: Record<string, any>;
};

export type RelationExt = Omit<Relation, "id" | "in" | "out"> & {
  id: string;
  in: string;
  out: string;
};

export type Cron = {
  id: RecordId;
  timestamp: number;
  on: boolean;
  schedule: string;
  content: string;
  source?: Agent;
  target?: Post;
  timezone?: string;
};

export type CronExt = Omit<Cron, "id" | "source" | "target"> & {
  id: string;
  source?: AgentExt;
  target?: PostExt;
};
