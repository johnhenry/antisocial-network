type ParserMetaData = any & {};
export type ParseResult = {
  metadata: ParserMetaData;
  content: AsyncGenerator<string>;
};
export type Parser = (buffer: Buffer, chunker: Chunker) => Promise<ParseResult>;
