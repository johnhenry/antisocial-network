const AsyncQueue = class {
  #queue;
  #resolvers;
  #ended;
  constructor() {
    this.#queue = [];
    this.#resolvers = [];
    this.#ended = false;
  }

  // Method to enqueue data into the queue
  enqueue(item) {
    if (this.#ended) {
      throw new Error("Cannot enqueue on a closed queue.");
    }
    if (this.#resolvers.length > 0) {
      const resolve = this.#resolvers.shift();
      resolve({ value: item, done: false });
    } else {
      this.#queue.push(item);
    }
  }

  // Method to end the queue
  end() {
    if (this.#ended) {
      throw new Error("Queue already ended.");
    }
    this.#ended = true;
    // Resolve all pending promises with done: true
    while (this.#resolvers.length > 0) {
      const resolve = this.#resolvers.shift();
      resolve({ value: undefined, done: true });
    }
  }

  // Method to create an asynchronous iterator
  [Symbol.asyncIterator]() {
    return {
      next: () => {
        if (this.#queue.length > 0) {
          const value = this.#queue.shift();
          return Promise.resolve({ value, done: false });
        }
        if (this.#ended) {
          return Promise.resolve({ value: undefined, done: true });
        }
        return new Promise((resolve) => {
          this.#resolvers.push(resolve);
        });
      },
    };
  }
};

// Usage Example
// async function exampleUsage() {
//   const asyncQueue = new AsyncQueue();

//   // Enqueue items
//   setTimeout(() => asyncQueue.enqueue(1), 100);
//   setTimeout(() => asyncQueue.enqueue(2), 200);
//   setTimeout(() => asyncQueue.enqueue(3), 300);
//   setTimeout(() => asyncQueue.end(), 400);

//   // Consume items
//   for await (const item of asyncQueue) {
//     console.log(item);
//   }

//   console.log('Queue has ended.');
// }

// exampleUsage();

const forkAsyncIterator = (iterator, num = 2) => {
  const queues = [];
  for (let i = 0; i < num; i++) {
    queues.push(new AsyncQueue());
  }
  (async () => {
    for await (const item of iterator) {
      queues.forEach((queue) => queue.enqueue(item));
    }
    queues.forEach((queue) => queue.end());
  })();
  return queues;
};

// Usage Example

// const exampleAsyncGenerator = async function* () {
//   for (let i = 0; i < 5; i++) {
//     yield i;
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }
// };

// const main = async () => {
//   const originalIterator = exampleAsyncGenerator();
//   const [i1, i2] = forkAsyncIterator(originalIterator);

//   (async () => {
//     for await (const value of i1) {
//       console.log(`Iterator 1: ${value}`);
//     }
//     console.log(1);
//   })();

//   (async () => {
//     for await (const value of i2) {
//       console.log(`Iterator 2: ${value}`);
//     }
//     console.log(2);
//   })();
// };

// main();

export default forkAsyncIterator;