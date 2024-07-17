// Please use the below type definitions below to synthesize a list of roughly 10 items that satsify PostExt, roughly 10 items that satisfy FileExt, and rougly 10 items that satisfy AgentExt.
// Uses variety and creativity. Where items are optional, please include examples where the items are fulfilled and not.
// Where items are list, please include examples where there are few items and where ther are multiple (up to 5).
// Define each of these items as constants. Use created items in the definition of other items.

// Once you've done that, collect each item type into an arrays and export them

import type { BaseMessageChunk } from "@langchain/core/messages";
import type { RecordId } from "surrealdb.js";

export type Post = {
  id: RecordId;
  timestamp: number;
  embedding: number[];
  files?: File[];
  mentions?: Agent[];
  content?: string;
  hash?: string;
  target?: Post;
  source?: Agent;
  tool?: string; // no spaces, \w characters, dashes, and colons
};

export type PostExt =
  & Omit<Post, "id" | "embedding" | "files" | "mentions" | "target" | "source">
  & {
    id: string; // e.g. post:i24y4ossr9er, post:aew482kngs9
    files?: FileExt[];
    mentions?: AgentExt[];
    target?: PostExt;
    source?: AgentExt;
  }; // content for PostEx is a textual summary of the content

export type Agent = {
  id: RecordId;
  timestamp: number;
  name: string;
  description: string;
  content: string;
  hash: string;
  embedding: number[];
  qualities: [string, string][];
  combinedQualities: string;
  parameters: AgentParameters;
  image: string;
  indexed: string;
};

export type AgentExt = Omit<Agent, "id" | "embedding"> & {
  id: string; // e.g. agent:6yweoaerserosr, agent:9nlanlj9adf
};

export type File = {
  id: RecordId;
  timestamp: number;
  content: string;
  hash: string;
  type: string; // e.g image/jpeg, application/json
  data: BinaryData;
  embedding: number[];
  publisher?: string;
  date?: string;
  name?: string;
  owner?: Agent;
};

export type FileExt = Omit<File, "id" | "embedding" | "data" | "owner"> & {
  id: string; // e.g. file:y24ros245ser, file:nl6d3anlj9adff
  data?: BinaryData;
  owner?: AgentExt;
};

export type FileProto = Omit<
  File,
  "id" | "timestamp" | "embedding" | "data" | "hash" | "data" | "embedding"
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
