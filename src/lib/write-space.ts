import "server-only";
const genRandomIntString = () => {
  return Math.floor(Math.random() * 1000000000).toString();
};

class WriterManager {
  #writers: Record<string, any> = {};
  #id: number;
  constructor() {
    this.#id = Math.random();
  }
  get id() {
    return this.#id;
  }
  setWriter(writer: any) {
    const name = genRandomIntString();

    this.#writers[name] = writer;
    return name;
  }
  get writers() {
    return this.#writers;
  }
  async deleteWriter(name: string): Promise<boolean> {
    const writer = this.writers[name];

    if (writer) {
      await writer.ready;
      await writer.close();
      delete this.#writers[name];
      return true;
    }
    return false;
  }
  sendToWriters(data: string) {
    for (const writer of Object.values(this.writers)) {
      writer.write(`data: ${data}\n\n`);
    }
  }
}

const writerManager = new WriterManager();

const getWriterManager = () => {
  return writerManager;
};

export default getWriterManager;
