export const langchainToOllama = ([role, content]: [string, string]) => ({
  role,
  content,
});

export const ollamaToLangchain = (
  { role, content }: { role: string; content: string },
) => [role, content];
