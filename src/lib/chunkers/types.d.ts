export type Embedding = number[];
export type EmbeddedChunk = [string, Embedding];
export type Corpus = EmbeddedChunk[];
export type Chunker<Input = string, Output = EmbeddedChunk> = (
  input: Input,
) => AsyncGenerator<Output>;
