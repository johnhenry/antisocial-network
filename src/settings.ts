const MAGIC_STRING = "";

// export const TABLE_QUEUE = `queue${MAGIC_STRING}`;
export const TABLE_AGENT = `agent${MAGIC_STRING}`;
export const TABLE_POST = `post${MAGIC_STRING}`;
export const TABLE_IDEA = `idea${MAGIC_STRING}`;
export const TABLE_DOC = `doc${MAGIC_STRING}`;
export const TABLE_TOOL = `tool${MAGIC_STRING}`;
export const TABLE_FILE = `file${MAGIC_STRING}`;
export const TABLE_EMBEDDING = `embedding${MAGIC_STRING}`;
export const TABLE_MEME = `meme${MAGIC_STRING}`;

// relations
export const TABLE_CONTAINS = `contains${MAGIC_STRING}`;
// a document contains many memes
export const TABLE_PROCEEDS = `proceeds${MAGIC_STRING}`;
// a meme proceedes another meme within a document
export const TABLE_INTERNALIZES = `internalizes${MAGIC_STRING}`;
// an agent internalizes a meme
export const TABLE_ELICITS = `elicits${MAGIC_STRING}`;
// a meme elicits another meme
export const TABLE_INCLUDES = `includes${MAGIC_STRING}`;
// an agent inserted a file or a meme
export const TABLE_INSERTED = `inserted${MAGIC_STRING}`;
// an agent inserted a file or a meme
export const TABLE_BOOKMARKS = `bookmarks${MAGIC_STRING}`;

export const DB_PATH = "http://127.0.0.1:8000/rpc";
export const DB_DATABASE = "test";
export const DB_NAMESPACE = "test";
export const DB_USERNAME = "root";
export const DB_PASSWORD = "root";

export const MODEL_BASIC = "llama3:latest";
export const MODEL_FUNCTIONS = "mistral:latest";
export const MODEL_EMBEDDING = "nomic-embed-text:latest";
export const MODEL_IMAGE = "llava:latest";

export const OLLAMA_LOCATION = "http://localhost:11434";

export const DEFAULT_USER_IMAGE = "/static/user.webp";

export const SIZE_MEME_PAGE = 16;
export const SIZE_EMBEDDING_VECTOR = 768;
