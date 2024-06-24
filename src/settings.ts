const MAGIC_STRING = "";

////
// Database
////

// Credentials
export const DB_PATH = "http://127.0.0.1:8000/rpc";
export const DB_DATABASE = "test";
export const DB_NAMESPACE = "test";
export const DB_USERNAME = "root";
export const DB_PASSWORD = "root";

// Tables
export const TABLE_AGENT = `agent${MAGIC_STRING}`;
export const TABLE_FILE = `file${MAGIC_STRING}`;
export const TABLE_MEME = `meme${MAGIC_STRING}`;
export const TABLE_TOOL = `tool${MAGIC_STRING}`;

// Relationships
export const REL_CONTAINS = `contains${MAGIC_STRING}`; // a file contains a meme
export const REL_INCLUDES = `include${MAGIC_STRING}`; // a meme includes a file
export const REL_PRECEDES = `precedes${MAGIC_STRING}`; // a meme proceedes another meme within a document
export const REL_REMEMBERS = `remembers${MAGIC_STRING}`;
// an agent internalizes a meme
export const REL_ELICITS = `elicits${MAGIC_STRING}`;
// a meme elicits another meme
export const REL_INSERTED = `inserted${MAGIC_STRING}`;
// an agent inserted a file or a meme
export const REL_BOOKMARKS = `bookmarks${MAGIC_STRING}`;
// an agent bookmarks a file

////
// A.I.
////
export const MODEL_BASIC = "llama3:latest";
export const MODEL_FUNCTIONS = "mistral:latest";
export const MODEL_EMBEDDING = "nomic-embed-text:latest";
export const MODEL_IMAGE = "llava:latest";
export const MODELS_OTHER = "";
export const MODELS = [
  ...new Set(
    [
      MODEL_BASIC,
      MODEL_FUNCTIONS,
      MODEL_EMBEDDING,
      MODEL_IMAGE,
      ...MODELS_OTHER.split(","),
    ].filter((model) => model)
  ),
];
export const OLLAMA_LOCATION = "http://localhost:11434";
export const DEFAULT_USER_IMAGE = "/static/user.webp";
export const SIZE_EMBEDDING_VECTOR = 768;

export const SIZE_KNN = 3;
