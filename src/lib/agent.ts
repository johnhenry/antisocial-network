const Agent = class {
  #id = null;
  constructor(id = null) {
    this.#id = id;
  }
  get id() {
    return this.#id;
  }
  internalize(id: string) {}
  forget(id: string) {}
};

export default Agent;
