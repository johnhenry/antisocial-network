import createBridge from "@/util/create-bridge";
export const createMeme = createBridge("/api/meme", { bridged: "meme" });
export const createAgent = createBridge("/api/agent", { bridged: "agent" });
export const createFile = createBridge("/api/file", { bridged: "file" });
export const createFiles = createBridge("/api/files", { bridged: "files" });
export default createMeme;
