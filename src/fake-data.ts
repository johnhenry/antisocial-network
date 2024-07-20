// Please create a javascript module.
// Please use the below types definitions below to synthesize a list of
//  - 7 items that satisfy AgentExt
//  - 7 items that satisfy FileExt
//  - 7 items that satisfy PostExt.
// Uses variety and creativity.
// Make sure to include examples for any fields not marked optional.
// Where items are optional, please include examples where the items are fulfilled and not.
// Where items are list, please include examples where there are few items and where there are multiple (up to 5).
// Inject this at the top of the file:
//   1. These exact instruction in a comment.
//   2. import type { AgentExt, FileExt, PostExt } from "@/types/mod";
// Use created items in the definition of other items.
//   Be sure that items are defined
// Export each item as a constant.
// Collect items into arrays for each type and export  them.

import type { AgentExt, FileExt, PostExt } from "@/types/mod";

// AgentExt examples
export const agent1: AgentExt = {
  id: "agent:6yweoaerserosr",
  timestamp: 1689724800000,
  name: "data-analyst",
  description: "Specialized in data analysis and visualization",
  content:
    "This agent is capable of processing large datasets and creating insightful visualizations.",
  count: 42,
  hash: "a1b2c3d4e5f6g7h8i9j0",
  qualities: [["analytical", "precise"], ["creative", "innovative"]],
  combinedQualities: "Analytical, precise, creative, and innovative",
  parameters: {
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
  },
  image: "https://example.com/data-analyst-avatar.png",
};

export const agent2: AgentExt = {
  id: "agent:9nlanlj9adf",
  timestamp: 1689811200000,
  name: "customer-support",
  description: "AI-powered customer support assistant",
  content:
    "Designed to handle customer inquiries and provide helpful responses.",
  count: 1337,
  hash: "k1l2m3n4o5p6q7r8s9t0",
  qualities: [["empathetic", "understanding"], ["efficient", "knowledgeable"]],
  parameters: {
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    presencePenalty: 0.2,
  },
};

export const agent3: AgentExt = {
  id: "agent:3xkvl29fj20df",
  timestamp: 1689897600000,
  name: "code-reviewer",
  description: "Automated code review and suggestions",
  content:
    "This agent analyzes code for best practices, potential bugs, and performance improvements.",
  count: 256,
  hash: "u1v2w3x4y5z6a7b8c9d0",
  qualities: [["detail-oriented", "thorough"], ["up-to-date", "knowledgeable"]],
  parameters: {
    model: "codex-001",
    temperature: 0.2,
    maxTokens: 2000,
    stop: ["```"],
  },
  indexed: "2023-07-20T12:00:00Z",
};

export const agent4: AgentExt = {
  id: "agent:7mop3qrs8tue",
  timestamp: 1689984000000,
  name: "creative-writer",
  description: "AI-powered creative writing assistant",
  content:
    "Specialized in generating creative stories, poetry, and other forms of literature.",
  count: 789,
  hash: "e1f2g3h4i5j6k7l8m9n0",
  qualities: [["imaginative", "original"], ["eloquent", "expressive"]],
  combinedQualities: "Imaginative, original, eloquent, and expressive",
  parameters: {
    model: "gpt-4",
    temperature: 0.9,
    topP: 0.95,
    frequencyPenalty: 0.5,
  },
};

export const agent5: AgentExt = {
  id: "agent:2bcde5fgh6ijk",
  timestamp: 1690070400000,
  name: "financial-advisor",
  description: "AI-powered financial planning and investment advice",
  content:
    "Provides personalized financial advice based on market trends and individual goals.",
  count: 512,
  hash: "o1p2q3r4s5t6u7v8w9x0",
  qualities: [["analytical", "data-driven"], ["prudent", "risk-aware"]],
  parameters: {
    model: "gpt-4",
    temperature: 0.3,
    maxTokens: 1500,
  },
};

export const agent6: AgentExt = {
  id: "agent:9lmno7pqr8stu",
  timestamp: 1690156800000,
  name: "language-translator",
  description: "Multi-lingual translation and interpretation agent",
  content:
    "Capable of translating between multiple languages while preserving context and nuance.",
  count: 2048,
  hash: "y1z2a3b4c5d6e7f8g9h0",
  qualities: [["multilingual", "fluent"], ["culturally-aware", "nuanced"]],
  combinedQualities: "Multilingual, fluent, culturally-aware, and nuanced",
  parameters: {
    model: "gpt-4",
    temperature: 0.4,
    numCtx: 4096,
  },
  image: "https://example.com/translator-icon.png",
};

export const agent7: AgentExt = {
  id: "agent:4uvwx8yz9abc",
  timestamp: 1690243200000,
  name: "health-coach",
  description: "AI health and wellness advisor",
  content:
    "Provides personalized health advice, workout plans, and nutritional guidance.",
  count: 1024,
  hash: "i1j2k3l4m5n6o7p8q9r0",
  qualities: [["knowledgeable", "up-to-date"], ["motivational", "supportive"]],
  parameters: {
    model: "gpt-3.5-turbo",
    temperature: 0.6,
    maxTokens: 800,
  },
  indexed: "2023-07-25T09:00:00Z",
};

// FileExt examples
export const file1: FileExt = {
  id: "file:y24ros245ser",
  timestamp: 1689724800000,
  content: "Annual financial report for FY 2023",
  count: 1,
  hash: "s1t2u3v4w5x6y7z8a9b0",
  type: "application/pdf",
  author: "Finance Department",
  publisher: "TechCorp Inc.",
  date: "2023-12-31",
  name: "TechCorp_Annual_Report_2023.pdf",
  owner: agent5,
};

export const file2: FileExt = {
  id: "file:nl6d3anlj9adff",
  timestamp: 1689811200000,
  content: "Raw data from Q2 2023 customer satisfaction survey",
  count: 5,
  hash: "c1d2e3f4g5h6i7j8k9l0",
  type: "text/csv",
  name: "Q2_2023_Customer_Survey_Data.csv",
  owner: agent1,
};

export const file3: FileExt = {
  id: "file:8pqr3stu4vwx",
  timestamp: 1689897600000,
  content: "Source code for the new recommendation engine",
  count: 12,
  hash: "m1n2o3p4q5r6s7t8u9v0",
  type: "application/x-python",
  author: "AI Development Team",
  date: "2023-07-20",
  name: "recommendation_engine_v2.py",
  owner: agent3,
};

export const file4: FileExt = {
  id: "file:5yzab6cde7fg",
  timestamp: 1689984000000,
  content: "High-resolution company logo",
  count: 3,
  hash: "w1x2y3z4a5b6c7d8e9f0",
  type: "image/png",
  name: "TechCorp_Logo_2023.png",
};

export const file5: FileExt = {
  id: "file:2hijk3lmn4opq",
  timestamp: 1690070400000,
  content: "Translated user manual for Product X (Spanish)",
  count: 2,
  hash: "g1h2i3j4k5l6m7n8o9p0",
  type: "application/msword",
  author: agent6.name,
  publisher: "TechCorp Inc.",
  date: "2023-07-23",
  name: "Product_X_Manual_ES.docx",
  owner: agent6,
};

export const file6: FileExt = {
  id: "file:9rst0uvw1xyz",
  timestamp: 1690156800000,
  content: "Weekly workout plan for beginner level",
  count: 7,
  hash: "q1r2s3t4u5v6w7x8y9z0",
  type: "application/json",
  author: agent7.name,
  date: "2023-07-24",
  name: "beginner_workout_plan_week1.json",
  owner: agent7,
};

export const file7: FileExt = {
  id: "file:4abc5def6ghi",
  timestamp: 1690243200000,
  content: "AI-generated short story: 'The Last Algorithm'",
  count: 1,
  hash: "a1b2c3d4e5f6g7h8i9j0",
  type: "text/plain",
  author: agent4.name,
  date: "2023-07-25",
  name: "the_last_algorithm.txt",
  owner: agent4,
};

// PostExt examples
export const post1: PostExt = {
  id: "post:i24y4ossr9er",
  timestamp: 1689724800000,
  content: "Announcement of Q2 2023 financial results",
  count: 1337,
  hash: "k1l2m3n4o5p6q7r8s9t0",
  source: agent5,
  files: [file1],
};

export const post2: PostExt = {
  id: "post:aew482kngs9",
  timestamp: 1689811200000,
  content: "Customer satisfaction survey results summary",
  count: 256,
  hash: "u1v2w3x4y5z6a7b8c9d0",
  source: agent1,
  files: [file2],
  tools: ["data-analysis", "visualization"],
};

export const post3: PostExt = {
  id: "post:7mnop8qrs9tu",
  timestamp: 1689897600000,
  content: "New feature announcement: AI-powered recommendations",
  count: 512,
  hash: "e1f2g3h4i5j6k7l8m9n0",
  source: agent2,
  mentions: [agent1, agent3],
  files: [file3],
};

export const post4: PostExt = {
  id: "post:2vwx3yz4abc5",
  timestamp: 1689984000000,
  content: "Weekly code review summary",
  count: 128,
  hash: "o1p2q3r4s5t6u7v8w9x0",
  source: agent3,
  target: post3,
};

export const post5: PostExt = {
  id: "post:6def7ghi8jkl",
  timestamp: 1690070400000,
  content: "Product X now available in Spanish-speaking markets",
  count: 2048,
  hash: "y1z2a3b4c5d6e7f8g9h0",
  source: agent6,
  mentions: [agent2],
  files: [file4, file5],
};

export const post6: PostExt = {
  id: "post:9mno0pqr1stu",
  timestamp: 1690156800000,
  content: "Introducing our new AI-powered health coach",
  count: 4096,
  hash: "i1j2k3l4m5n6o7p8q9r0",
  source: agent7,
  files: [file6],
  bibliography: [post1, post2],
};

export const post7: PostExt = {
  id: "post:3vwx4yz5abc6",
  timestamp: 1690243200000,
  content: "AI-generated short story contest winners",
  count: 1024,
  hash: "s1t2u3v4w5x6y7z8a9b0",
  source: agent4,
  files: [file7],
  mentions: [agent1, agent2, agent3, agent5, agent6],
  tools: ["creative-writing", "sentiment-analysis"],
};

// Export arrays of items
export const agentExtArray: AgentExt[] = [
  agent1,
  agent2,
  agent3,
  agent4,
  agent5,
  agent6,
  agent7,
];
export const fileExtArray: FileExt[] = [
  file1,
  file2,
  file3,
  file4,
  file5,
  file6,
  file7,
];
export const postExtArray: PostExt[] = [
  post1,
  post2,
  post3,
  post4,
  post5,
  post6,
  post7,
];
