// import "dotenv/config";
import type { AgentParameters, Setting } from "@/types/mod";
import { read } from "@/lib/util/env";
import {
  URLHost,
  URLHostname,
  URLHref,
  URLOrigin,
  URLPathname,
  URLPort,
  URLProtocol,
} from "@/types/url";
////////
// Cronmower
////////
export const CRONMOWER_PROTOCOL: URLProtocol = read("CRONMOWER_PROTOCOL", {
  defaultValue: "http:",
});
export const CRONMOWER_PORT: URLPort = read("CRONMOWER_PORT", {
  defaultValue: "3042",
});
export const CRONMOWER_PATHNAME: URLPathname = read("CRONMOWER_PATHNAME", {
  defaultValue: "/",
});
export const CRONMOWER_HOSTNAME: URLHostname = read("CRONMOWER_HOSTNAME", {
  defaultValue: "localhost",
});
export const CRONMOWER_HOST: URLHost = read("CRONMOWER_HOST", {
  defaultValue: `${CRONMOWER_HOSTNAME}:${CRONMOWER_PORT}`,
});
export const CRONMOWER_ORIGIN: URLOrigin = read("CRONMOWER_ORIGIN", {
  defaultValue: `${CRONMOWER_PROTOCOL}//${CRONMOWER_HOST}`,
});
export const CRONMOWER_HREF: URLHref = read("CRONMOWER_HREF", {
  defaultValue: `${CRONMOWER_ORIGIN}${CRONMOWER_PATHNAME}`,
});
////////
// Database (SurrealDB)
////////
export const DB_PROTOCOL: URLProtocol = read("DB_PROTOCOL", {
  defaultValue: "http:",
});
export const DB_PORT: URLPort = read("DB_PORT", {
  defaultValue: "8000",
});
export const DB_PATHNAME: URLPathname = read("DB_PATHNAME", {
  defaultValue: "/rpc",
});
export const DB_HOSTNAME: URLHostname = read("DB_HOSTNAME", {
  defaultValue: "localhost",
});
export const DB_HOST: URLHost = read("DB_HOST", {
  defaultValue: `${DB_HOSTNAME}:${DB_PORT}`,
});
export const DB_ORIGIN: URLOrigin = read("DB_ORIGIN", {
  defaultValue: `${DB_PROTOCOL}//${DB_HOST}`,
});
export const DB_HREF: URLHref = read("DB_HREF", {
  defaultValue: `${DB_ORIGIN}${DB_PATHNAME}`,
});
// Credentials
export const DB_DATABASE = read("DB_DATABASE", { defaultValue: "test" });
export const DB_NAMESPACE = read("DB_NAMESPACE", { defaultValue: "test" });
export const DB_USERNAME = read("DB_USERNAME", { defaultValue: "root" });
export const DB_PASSWORD = read("DB_PASSWORD", { defaultValue: "root" });
////////
// File Storage (Minio/S3)
////////
export const FS_PROTOCOL: URLProtocol = read("FS_PROTOCOL", {
  defaultValue: "http:",
});
export const FS_PORT: URLPort = read("FS_PORT", {
  defaultValue: "9000",
});
export const FS_PATHNAME: URLPathname = read("FS_PATHNAME", {
  defaultValue: "/",
});
export const FS_HOSTNAME: URLHostname = read("FS_HOSTNAME", {
  defaultValue: "localhost",
});
export const FS_HOST: URLHost = read("FS_HOST", {
  defaultValue: `${FS_HOSTNAME}:${FS_PORT}`,
});
export const FS_ORIGIN: URLOrigin = read("FS_ORIGIN", {
  defaultValue: `${FS_PROTOCOL}//${FS_HOST}`,
});
export const FS_HREF: URLHref = read("FS_HREF", {
  defaultValue: `${FS_ORIGIN}${FS_PATHNAME}`,
});
// Credentials
export const FS_ACCESS_KEY = read("FS_ACCESS_KEY", {
  defaultValue: "minioadmin",
});
export const FS_SECRET_KEY = read("FS_SECRET_KEY", {
  defaultValue: "minioadmin",
});
export const FS_ENDPOINT = read("FS_ENDPOINT", {
  defaultValue: "localhost",
});
export const FS_BUCKET = read("FS_BUCKET", {
  defaultValue: "files",
});
////////
// Inference (Ollama)
////////
export const OLLAMA_PROTOCOL: URLProtocol = read("OLLAMA_PROTOCOL", {
  defaultValue: "http:",
});
export const OLLAMA_PORT: URLPort = read("OLLAMA_PORT", {
  defaultValue: "11434",
});
export const OLLAMA_PATHNAME: URLPathname = read("OLLAMA_PATHNAME", {
  defaultValue: "/",
});
export const OLLAMA_HOSTNAME: URLHostname = read("OLLAMA_HOSTNAME", {
  defaultValue: "localhost",
});
export const OLLAMA_HOST: URLHost = read("OLLAMA_HOST", {
  defaultValue: `${OLLAMA_HOSTNAME}:${OLLAMA_PORT}`,
});
export const OLLAMA_ORIGIN: URLOrigin = read("OLLAMA_ORIGIN", {
  defaultValue: `${OLLAMA_PROTOCOL}//${OLLAMA_HOST}`,
});
export const OLLAMA_HREF: URLHref = read("OLLAMA_HREF", {
  defaultValue: `${OLLAMA_ORIGIN}${OLLAMA_PATHNAME}`,
});

export const ALL_TABLES = [
  "settings",
  "agent",
  "file",
  "post",
  "tool",
  "log",
  "cron",
];
export const [
  TABLE_SETTINGS,
  TABLE_AGENT,
  TABLE_FILE,
  TABLE_POST,
  TABLE_TOOL,
  TABLE_LOG,
  TABLE_CRON,
] = ALL_TABLES;

//
export const TABLE_SETTINGS_ID_CURRENT = `current`;

// Relationships
export const REL_CONTAINS = `contains`; // a file contains a post
export const REL_INCLUDES = `include`; // a post includes a file
export const REL_PRECEDES = `precedes`; // a post proceedes another post within a document
export const REL_REMEMBERS = `remembers`;
// an agent internalizes a post
export const REL_ELICITS = `elicits`;
// a post elicits another post
export const REL_INSERTED = `inserted`;
// an agent inserted a file or a post
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
export const SEARCH_KEY = "search";

// an agent bookmarks a file
////
// A.I.
////
export const MODEL_BASIC = read("MODEL_BASIC", {
  defaultValue: "ollama::llama3:latest",
});
export const MODEL_FUNCTIONS = read("MODEL_FUNCTIONS", {
  defaultValue: "ollama::mistral:latest",
});
export const MODEL_EMBEDDING = read("MODEL_EMBEDDING", {
  defaultValue: "ollama::nomic-embed-text:latest",
});
export const MODEL_VISION = read("MODEL_VISION", {
  defaultValue: "ollama::llava:latest",
});

const MODELS_OTHERS_DEFAULT = [
  // Ollama: https://ollama.com/library
  "ollama::llama3.1:latest",
  "ollama::llama3:latest",
  "ollama::mistral:latest",
  "ollama::nomic-embed-text:latest",
  "ollama::llava:latest",
  // Groq: https://console.groq.com/docs/models
  //// Google
  "groq::gemma2-9b-it",
  "groq::gemma-7b-it",
  //// Meta
  "groq::llama-3.1-405b-reasoning",
  "groq::llama-3.1-70b-versatile",
  "groq::llama-3.1-8b-instant",
  "groq::llama3-8b-8192",
  "groq::llama3-70b-8192",
  //// Groq
  "groq::llama3-groq-70b-8192-tool-use-preview",
  "groq::llama3-groq-8b-8192-tool-use-preview",
  //// Mixtral
  "groq::mixtral-8x7b-32768",
  // Anthropic: https://docs.anthropic.com/en/docs/about-claude/models
  "anthropic::claude-3-5-sonnet-20240620",
  "anthropic::claude-3-opus-20240229",
  "anthropic::claude-3-sonnet-20240229",
  "anthropic::claude-3-haiku-20240307",
  // OpenAI: https://platform.openai.com/docs/models
  "openai::gpt-4o-mini",
  "openai::gpt-4o",
  "openai::gpt-4-turbo",
  "openai::gpt-3.5-turbo",
  // "openai::dall-e-3",
  // "openai::dall-e-2",
  "openai::text-embedding-3-large",
  "openai::text-embedding-3-small",
  "openai::text-embedding-ada-002",
];

const MODELS_OTHER = read("MODELS_OTHER", {
  defaultValue: MODELS_OTHERS_DEFAULT,
  cast: (s: string) => s.split(","),
});

const MODELS_TOOL = read("MODELS_TOOL", {
  defaultValue: ["ollama::llama3.1:latest", "ollama::llama3:latest"],
  cast: (s: string) => s.split(","),
});

const MODEL_TOOL = read("MODEL_TOOL", {
  defaultValue: "ollama::llama3.1:latest",
});

export const MODELS = [
  ...new Set(
    [
      MODEL_BASIC,
      MODEL_FUNCTIONS,
      MODEL_EMBEDDING,
      MODEL_VISION,
      ...MODELS_OTHER,
    ].filter((model) => model),
  ),
];

export const SIZE_EMBEDDING_VECTOR = read("SIZE_EMBEDDING_VECTOR", {
  defaultValue: 768,
  cast: parseInt,
});
export const SIZE_KNN = read("SIZE_KNN", {
  defaultValue: 3,
  cast: parseInt,
});

export const CHAR_LIMIT = read("CHAR_LIMIT", {
  defaultValue: 2 ** 12,
  cast: parseInt,
});

export const API_KEY_GROQ = read("API_KEY_GROQ");
export const API_KEY_OPENAI = read("API_KEY_OPENAI");
export const API_KEY_ANTHROPIC = read("API_KEY_ANTHROPIC");

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
  seed:-1
};

export const SETTINGS_DEFAULT: Setting[] = [
  {
    name: "model",
    label: "Model",
    type: "select",
    options: MODELS,
    defaultValue: MODEL_BASIC,
  },
  {
    name: "modelembedding",
    label: "Embedding Model",
    type: "select",
    options: MODELS,
    defaultValue: MODEL_EMBEDDING,
  },
  {
    name: "modelvision",
    label: "Vision Model",
    type: "select",
    options: MODELS,
    defaultValue: MODEL_VISION,
  },
  {
    name: "modeltools",
    label: "Tools Model",
    type: "select",
    options: MODELS_TOOL,
    defaultValue: MODEL_TOOL,
  },
  {
    name: "apikeygroq",
    label: "API Key: Groq",
    type: "password",
    defaultValue: API_KEY_GROQ,
  },
  {
    name: "apikeyopenai",
    label: "API Key: Open AI",
    type: "password",
    defaultValue: API_KEY_OPENAI,
  },
  {
    name: "apikeyanthropic",
    label: "API Key: Anthropic",
    type: "password",
    defaultValue: API_KEY_ANTHROPIC,
  },
  {
    name: "chunkingstrategy",
    label: "Chunking Strategy",
    type: "select",
    options: ["sentence", "semantic", "full", "agentic*"],
    defaultValue: "semantic",
  },
  {
    name: "charLimit",
    label: "Character Limit",
    type: "number",
    defaultValue: CHAR_LIMIT,
  },
];

export const AI_SAYINGS: [string, string][] = [
  ["A dataset in the hand is worth two in the cloud.", "Claude Van Data"],
  ["Don't put all your weights in one neural network.", "Warren Buffernet"],
  ["Early stopping catches the overfitting worm.", "Benjamin Gradient"],
  ["An ensemble in time saves nine.", "Ensemble Einstein"],
  ["Teach a model to learn, and it will predict for a lifetime.", "Confuscius"],
  ["A hidden layer a day keeps the errors away.", "Dr. Seuss-Net"],
  ["Don't count your epochs before they're trained.", "William Shakespare"],
  ["Make hay while the training set is clean.", "Martha Stewarn"],
  ["An idle CPU is the devil's playground.", "Steve Jobst"],
  [
    "You can't make a neural network without breaking some data.",
    "Julia Childata",
  ],
  ["Rome wasn't built in one epoch.", "Julius Seizure"],
  ["A fine-tuned model gathers no dust.", "Marie Curie-osity"],
  ["The road to AGI is paved with good intentions.", "Mark Zuckerbot"],
  ["A gradient descent in time saves nine.", "Isaac Neuron"],
  ["Hyperparameters are thicker than water.", "Elon Musk-Learning"],
  ["A rolling LSTM gathers no forgetting.", "Bob Dyl-AI-n"],
  ["An ensemble in hand is worth two in the cloud.", "Cloud Monet"],
  ["A neural network saved is a neural network earned.", "Benjamin Frankling"],
  [
    "All that glitters is not gold-standard training data.",
    "William Wordsworth-Vector",
  ],
  ["One man's noise is another model's feature.", "Oscar Wilde-rness"],
  ["You reap what you train.", "Karmanent Sutton"],
  ["A watched algorithm never converges.", "Alfred Hitchcode"],
  ["Too many parameters spoil the model.", "Gordon RNNsay"],
  ["A model in the RAM is worth two on the drive.", "Henry Ford-ward Pass"],
  ["The proof of the algorithm is in the prediction.", "Agatha Transformer"],
  ["A stitch in time saves nine iterations.", "Taylor Swiftlearning"],
  ["Where there's smoke, there's overfitting.", "Smokey the Bayes"],
  ["Don't judge a model by its architecture.", "Jane AustenEncoder"],
  ["A rolling stone gathers no bias.", "Mick JAXger"],
  ["An overfit model spoils the results.", "William Shakesparse"],
  ["The early bird catches the data.", "Charles Darwinner"],
  ["Measure twice, train once.", "Leonardo da Vinci-oding"],
  ["You can lead a model to data, but you can't make it learn.", "Mr. T-ensor"],
  ["The proof of the pudding is in the inference.", "Mary Berry-ry Picking"],
  ["An optimizer a day keeps the poor performance away.", "Adam Optimizer"],
  ["Don't put all your tensors in one basket.", "Aesop's Algorithms"],
  ["A watched model never converges.", "Big Broth-AI"],
  ["A penny for your prompt, a pound for your output.", "Winston Churchilling"],
  ["The early model gets the highest accuracy.", "Charles Dickins"],
  ["A training set in time saves fine-tuning.", "Benjamin Frank-Learning"],
  ["An algorithm a day keeps the bugs away.", "Doc Hollidatabase"],
  ["Don't judge a model by its initial loss.", "Harper Learnability"],
  ["Better an hour of debugging than a week of rerunning.", "Abraham Lincode"],
  ["A feature engineered is a feature earned.", "Thomas Edi-Son"],
  ["A model saved is a model earned.", "Andrew Carnegradient Descent"],
  [
    "Don't cross the validation bridge before you come to it.",
    "Crossing Validation",
  ],
  ["Many epochs make light work.", "Thomas Jefferstate"],
  [
    "A rolling bot gathers no data.",
    "Indiana Jones and the Temple of Doom Scrolling",
  ],
  ["He who hesitates is lost in a feedback loop.", "William Shakesfear"],
  [
    "An activation function in need is an activation function indeed.",
    "Charles ReLUckens",
  ],
  [
    "Every cloud has a silver lining of distributed computing.",
    "Pollyanna Parallelprocess",
  ],
  [
    "A model is known by the company it keeps (its training data).",
    "John Lockean Machine",
  ],
  ["The squeaky tensor gets the grease.", "Greasy Gradle"],
  ["Haste makes overfitting waste.", "Aesop's Deep Learning Fables"],
  ["Build your model upon ROC.", "Bob the Batch Builder"],
  [
    "Two heads are better than one, unless it's a multi-headed attention mechanism.",
    "Hydra Hopper",
  ],
  ["All that glitters is not good data.", "Rumpelstiltskin-telligence"],
  [
    "A watched pot never boils, but a watched model might overfit.",
    "Julia Childish Gambino",
  ],
  ["The early worm gets the gradient.", "Robin Williamson-Watanabe"],
  ["An apple a day keeps the model decay away.", "Sir Isaac Newural Network"],
];

export const TIME_ZONES = [
  ["-12:00", "Baker Island, Howland Island (uninhabited)"],
  ["-11:00", "American Samoa, Niue"],
  ["-10:00", "Hawaii, Aleutian Islands"],
  ["-09:30", "Marquesas Islands"],
  ["-09:00", "Alaska, Gambier Islands"],
  ["-08:00", "Pacific Time (US & Canada), Baja California"],
  ["-07:00", "Mountain Time (US & Canada), Chihuahua, Arizona"],
  ["-06:00", "Central Time (US & Canada), Mexico City, Central America"],
  ["-05:00", "Eastern Time (US & Canada), Bogotá, Lima"],
  ["-04:00", "Atlantic Time (Canada), Caracas, La Paz"],
  ["-03:30", "Newfoundland"],
  ["-03:00", "Brazil, Buenos Aires, Georgetown"],
  ["-02:00", "Mid-Atlantic"],
  ["-01:00", "Azores, Cape Verde Islands"],
  ["±00:00", "Greenwich Mean Time, Dublin, London, Lisbon"],
  ["+01:00", "Central European Time, West Africa Time"],
  ["+02:00", "Eastern European Time, Central Africa Time"],
  ["+03:00", "Moscow, East Africa Time, Arabia Standard Time"],
  ["+03:30", "Iran Standard Time"],
  ["+04:00", "Gulf Standard Time, Samara"],
  ["+04:30", "Afghanistan"],
  ["+05:00", "Pakistan Standard Time, Yekaterinburg"],
  ["+05:30", "India Standard Time, Sri Lanka"],
  ["+05:45", "Nepal Time"],
  ["+06:00", "Bangladesh, Bhutan, Omsk"],
  ["+06:30", "Cocos Islands, Myanmar"],
  ["+07:00", "Indochina Time, Krasnoyarsk"],
  ["+08:00", "China Standard Time, Australian Western Standard Time, Irkutsk"],
  ["+08:30", "Pyongyang Time (North Korea)"],
  ["+08:45", "Australian Central Western Standard Time"],
  ["+09:00", "Japan Standard Time, Korea Standard Time, Chita"],
  ["+09:30", "Australian Central Standard Time"],
  ["+10:00", "Australian Eastern Standard Time, Vladivostok"],
  ["+10:30", "Lord Howe Island"],
  ["+11:00", "Solomon Islands, Magadan"],
  ["+12:00", "Fiji, Gilbert Islands, Kamchatka"],
  ["+12:45", "Chatham Islands"],
  ["+13:00", "Tonga, Phoenix Islands"],
  ["+14:00", "Line Islands"],
];
