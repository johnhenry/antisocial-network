import "server-only";
const genRandomIntString = () => {
  return Math.floor(Math.random() * 1000000000).toString();
};

class WriterManager {
  #writers: Record<string, any> = {};
  #id:number;
  constructor() {
    this.#id = Math.random();
  }
  get id () {
    return this.#id;
  }
  setWriter(writer: any) {
    const name = genRandomIntString();

    this.#writers[name] = writer;
    // console.log("Writer set", this.#writers, name);
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
    // console.log("Sending to writers", this.#writers, data);
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

// const writers: Record<string, any> = {};

// export const setWriter = (writer: any) => {
//   const name = genRandomIntString();
//   writers[name] = writer;
//   console.log("Writer set", writers, name);
//   return name;
// };

// export const deleteWriter = async (name: string): boolean => {
//   const writer = writers[name];
//   if (writer) {
//     await writer.ready;
//     await writer.close();
//     delete writers[name];
//     return true;
//   }
//   return false;
// };

// export const sendToWriters = (data: string) => {
//   console.log("Sending to writers", writers, data);
//   for (const writer of Object.values(writers)) {
//     writer.write(`data: ${data}\n\n`);
//   }
// };
