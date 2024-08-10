import { getAllAgentNamesAndIds } from "@/lib/database/mod";
import { descriptorsByName as TOOLS } from "@/hashtools/descriptors/mod";

export type Option = {
  id: number;
  name: string;
  avatar?: string;
  symbol?: string;
};

export type Trigger = {
  pattern: RegExp;
  fetchOptions: (search: string) => Promise<Option[]> | Option[];
  color: string;
};

export const DoubleColon_Emoji: Trigger = {
  pattern: /(?:^|\s)::([\w-]*)$/,
  fetchOptions: async (search: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const emojis = [
      { id: 1, name: "smile", symbol: "😊" },
      { id: 2, name: "heart", symbol: "❤️" },
      { id: 3, name: "thumbsup", symbol: "👍" },
    ];
    return emojis.filter((emoji) =>
      emoji.name.toLowerCase().includes(search.toLowerCase())
    );
  },
  color: "#ed8936",
};

export const Hashtag_ToolName: Trigger = {
  pattern: /(?:^|\s)#([\w-]*)$/,
  fetchOptions: (search: string) => {
    const tags = Object.keys(TOOLS).map((name, id) => ({
      id,
      name,
    }));
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase())
    );
  },
  color: "#48bb78",
};

export const At_AgentName_ID: Trigger = {
  pattern: /(?:^|\s)@([\w-:]*)$/,
  fetchOptions: async (search: string) => {
    const names = await getAllAgentNamesAndIds();
    return names
      .filter(([name]) => {
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .map(([name, symbol], index) => ({
        id: index,
        name,
        symbol,
      }));
  },
  color: "#4a5568",
};

export const At_AgentName = {
  pattern: /(?:^|\s)@([\w-:]*)$/,
  fetchOptions: async (search: string) => {
    const names = await getAllAgentNamesAndIds();
    return names
      .filter(([name]) => {
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .map(([name], index) => ({
        id: index,
        name,
      }));
  },
  color: "#4a5568",
};
