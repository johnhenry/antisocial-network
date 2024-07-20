export type Chunker<T = any> = (text: string) => AsyncGenerator<T>;
