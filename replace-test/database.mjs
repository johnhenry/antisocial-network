const FAKE_DB = {
  genId(tb = "agent", id = Math.random().toString(36).slice(2)) {
    return `${tb}:${id}`;
  },
  async newAgent(body = {}, id = this.genId()) {
    const agent = { ...body };
    this[id] = agent;
    return { ...agent, id };
  },
  async init(initObject = {}) {
    const created = [];
    for (const [id, body] of Object.entries(initObject)) {
      created.push(this.newAgent(body, id));
    }
    return created;
  },
  async createAgentById(id) {
    const [_, name] = id.split(":");
    return this.newAgent({ name }, id);
  },
  async createAgentByName(name) {
    const id = `agent:${Math.random().toString(36).slice(2)}`;
    return this.newAgent({ name }, id);
  },
  async getAgentByName(name) {
    if (name.startsWith("agent:")) {
      return this.getAgentById(name);
    }
    const entry = Object.entries(this).find(
      ([_, agent]) => agent.name === name
    );
    if (!entry) {
      return this.createAgentByName(name);
    }
    return { ...entry[1], id: entry[0] };
  },
  async getAgentById(id) {
    if (!id.startsWith("agent:")) {
      return this.getAgentByName(id);
    }
    const agent = this[id];
    if (!agent) {
      return this.createAgentById(id);
    }
    return { ...agent, id };
  },
};
export const MOCK_DB = Object.create(FAKE_DB);

export default MOCK_DB;
