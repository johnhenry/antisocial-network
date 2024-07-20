type ParserMetaData = any & {};
export type ParseResult = {
  metadata: ParserMetaData;
  text: string;
};
export type Parser = (buffer: Buffer) => Promise<ParseResult>;
