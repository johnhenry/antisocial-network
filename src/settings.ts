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
  // https://console.groq.com/docs/models
  "groq::llama3-8b-8192",
  "groq::llama3-70b-8192",
  "groq::mixtral-8x7b-32768",
  "groq::gemma-7b-it",
  // https://docs.anthropic.com/en/docs/about-claude/models
  "anthropic::claude-3-5-sonnet-20240620",
  "anthropic::claude-3-opus-20240229",
  "anthropic::claude-3-sonnet-20240229",
  "anthropic::claude-3-haiku-20240307",
  // https://platform.openai.com/docs/models
  "openai::gpt-4o",
  "openai::gpt-4-turbo",
  "openai::gpt-3.5-turbo",
  "openai::dall-e-3",
  "openai::dall-e-2",
  "openai::text-embedding-3-large",
  "openai::text-embedding-3-small",
  "openai::text-embedding-ada-002",
];

const MODELS_OTHER = read("MODELS_OTHER", {
  defaultValue: MODELS_OTHERS_DEFAULT,
  cast: (s: string) => s.split(","),
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
export const OLLAMA_LOCATION = read("OLLAMA_LOCATION", {
  defaultValue: "http://localhost:11434",
});

export const SIZE_EMBEDDING_VECTOR = read("SIZE_EMBEDDING_VECTOR", {
  defaultValue: 768,
  cast: parseInt,
});
export const SIZE_KNN = read("SIZE_KNN", {
  defaultValue: 3,
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
  model: undefined,
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
    label: "Chunking Strategy*",
    type: "select",
    options: ["sentence", "semantic", "agentic"],
    defaultValue: MODEL_EMBEDDING,
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
