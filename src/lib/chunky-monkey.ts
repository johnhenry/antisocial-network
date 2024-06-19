type CompareFunction = (vectorA: number[], vectorB: number[]) => number;
type EmbedFunction = (...strings: string[]) => number[];

const ChunkyMoneky = class {
  #embed: EmbedFunction | null;
  #compare: CompareFunction | null;
  #splits: (string | RegExp)[] = [];
  #tokenizer: any;
  constructor({
    embed = null,
    compare = null,
    splits = [],
  }: /*
      should we allow splits to be an enum as well of PARAGRAPHS, SENTENCES, TOKENS, WORDS, CHARACTERS?
    */
  {
    embed?: EmbedFunction | null;
    compare?: CompareFunction | null;
    splits?: (string | RegExp)[];
  } = {}) {
    this.#embed = embed;
    this.#compare = compare;
    this.#splits = splits;
  }
  split(text: string) {
    // split string iteratively
    const splits = [...this.#splits];
    const chunks: string[][] = [];
    const stack: { text: string; splits: (string | RegExp)[] }[] = [];
    stack.push({ text, splits });
    while (stack.length > 0) {
      const { text, splits } = stack.pop()!;
      if (splits.length === 0) {
        chunks.push([text]);
      } else {
        const split = splits[0];
        const remainingSplits = splits.slice(1);
        const parts = text.split(split);
        parts.forEach((part) => {
          stack.push({ text: part, splits: remainingSplits });
        });
      }
    }
    return chunks.flat();
  }
  async *semanticSplit(text: string, { twoPass = false } = {}) {
    // split text semantically
    const chunks = this.split(text);
    for (const chunk of chunks) {
      if (this.#embed) {
        const embedding = this.#embed(chunk);
        yield { chunk, embedding };
      } else {
        yield { chunk };
      }
    }
  }
};

const brassmonkey = new ChunkyMonkey(...);

const text = "...";

for await (const { chunk, embedding } of brassmonkey.semanticSplit(text)) {
  // feed two birds with one scome by re-using the generated embedding
  console.log(chunk);
  console.log(embedding);
}
