import type { BaseMessageChunk } from "@langchain/core/messages";
import type { RecordId } from "surrealdb.js";

export type Meme = {
  id: string | RecordId;
  timestamp?: number;
  content?: string;
  hash?: string;
  embedding: number[];
};

export type Agent = {
  id: string | RecordId;
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

export type File = {
  id: string | RecordId;
  timestamp: number;
  content: string;
  hash: string;
  type: string;
  data: BinaryData;
  embedding: number[];
  publisher: string | null;
  publishDate: string | null;
  name: string | null;
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
