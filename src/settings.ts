// import "dotenv/config";
import type { AgentParameters, Setting } from "@/types/types";
import { read } from "@/util/getEnv";
////
// Database
////
// Credentials
export const DB_PATH = read("DB_PATH", {
  defaultValue: "http://127.0.0.1:8000/rpc",
});
export const DB_DATABASE = read("DB_DATABASE", { defaultValue: "test" });
export const DB_NAMESPACE = read("DB_NAMESPACE", { defaultValue: "test" });
export const DB_USERNAME = read("DB_USERNAME", { defaultValue: "root" });
export const DB_PASSWORD = read("DB_PASSWORD", { defaultValue: "root" });
// Tables
export const TABLE_SETTINGS = `settings`;
export const TABLE_AGENT = `agent`;
export const TABLE_FILE = `file`;
export const TABLE_MEME = `meme`;
export const TABLE_TOOL = `tool`;
export const ALL_TABLES = [
  TABLE_SETTINGS,
  TABLE_AGENT,
  TABLE_FILE,
  TABLE_MEME,
  TABLE_TOOL,
];
//
export const TABLE_SETTINGS_ID_CURRENT = `current`;

// Relationships
export const REL_CONTAINS = `contains`; // a file contains a meme
export const REL_INCLUDES = `include`; // a meme includes a file
export const REL_PRECEDES = `precedes`; // a meme proceedes another meme within a document
export const REL_REMEMBERS = `remembers`;
// an agent internalizes a meme
export const REL_ELICITS = `elicits`;
// a meme elicits another meme
export const REL_INSERTED = `inserted`;
// an agent inserted a file or a meme
export const REL_BOOKMARKS = `bookmarks`;
export const ALL_RELATIONSHIPS = [
  REL_CONTAINS,
  REL_INCLUDES,
  REL_PRECEDES,
  REL_REMEMBERS,
  REL_ELICITS,
  REL_INSERTED,
  REL_BOOKMARKS,
];

//
export const MASQUERADE_KEY = "masquerade";

// an agent bookmarks a file
////
// A.I.
////
export const MODEL_BASIC = read("MODEL_BASIC", {
  defaultValue: "llama3:latest",
});
export const MODEL_FUNCTIONS = read("MODEL_FUNCTIONS", {
  defaultValue: "mistral:latest",
});
export const MODEL_EMBEDDING = read("MODEL_EMBEDDING", {
  defaultValue: "nomic-embed-text:latest",
});
export const MODEL_IMAGE = read("MODEL_IMAGE", {
  defaultValue: "llava:latest",
});
const MODELS_OTHER = read("MODELS_OTHER", {
  defaultValue: [],
  cast: (s: string) => s.split(","),
});
export const MODELS = [
  ...new Set(
    [
      MODEL_BASIC,
      MODEL_FUNCTIONS,
      MODEL_EMBEDDING,
      MODEL_IMAGE,
      ...MODELS_OTHER,
    ].filter((model) => model)
  ),
];
export const OLLAMA_LOCATION = read("OLLAMA_LOCATION", {
  defaultValue: "http://localhost:11434",
});
export const DEFAULT_USER_IMAGE = read("DEFAULT_USER_IMAGE", {
  defaultValue: "/static/user.webp",
});
export const SIZE_EMBEDDING_VECTOR = read("SIZE_EMBEDDING_VECTOR", {
  defaultValue: 768,
  cast: parseInt,
});
export const SIZE_KNN = read("SIZE_KNN", {
  defaultValue: 3,
  cast: parseInt,
});

export const DEFAULT_PARAMETERS_AGENT: AgentParameters = {
  embeddingOnly: false,
  // f16KV: false,
  frequencyPenalty: 0,
  headers: {},
  keepAlive: undefined,
  logitsAll: undefined,
  lowVram: undefined,
  mainGpu: 0,
  model: MODEL_BASIC,
  baseUrl: undefined,
  mirostat: 0,
  mirostatEta: 0.1,
  mirostatTau: 0.5,
  numBatch: undefined,
  numCtx: 2048,
  numGpu: undefined,
  numGqa: undefined,
  numKeep: undefined,
  numPredict: 128,
  numThread: undefined,
  penalizeNewline: false,
  presencePenalty: undefined,
  repeatLastN: undefined,
  repeatPenalty: 1.1,
  ropeFrequencyBase: undefined,
  ropeFrequencyScale: undefined,
  temperature: 0.1,
  stop: undefined,
  tfsZ: undefined,
  topK: 40,
  topP: 0.9,
  typicalP: undefined,
  useMLock: undefined,
  useMMap: undefined,
  vocabOnly: undefined,
  format: undefined,
};

export const SETTINGS_DEFAULT: Setting[] = [
  {
    name: "model",
    label: "Model",
    type: "select",
    options: MODELS,
    defaultValue: MODEL_BASIC,
  },
];
