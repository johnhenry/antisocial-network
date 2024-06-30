type BrigedFunction = (
  body: Record<string, any>,
  options: Record<string, any>
) => Promise<Record<string, any>>;

const removeValues = (
  object: Record<string, any>,
  ...omitted: any
): Record<string, any> =>
  Object.fromEntries(
    Object.entries(object).filter(([_, value]) => !omitted.includes(value))
  );

const createBridge = (
  endpoint: string,
  {
    method = "POST",
    bridged = "",
    streaming = false,
  }: { method?: string; bridged?: string } = {}
): BrigedFunction => {
  return async (body, options) => {
    const queryParams = new URLSearchParams(
      removeValues(options, undefined)
    ).toString();
    const response = await fetch(`${endpoint}?${queryParams}`, {
      body: JSON.stringify(body),
      headers: {
        "x-bridged": bridged,
        "x-stream": streaming || "",
      },
      method,
    });

    if (response.ok) {
      const ids = response.headers.get("x-id")?.split(",");
      if (options.streaming) {
        const id = ids[1];
        return [id, response.body];
      }
      const [id] = ids;
      const text = await response.text();
      try {
        return [id, JSON.parse(text)];
      } catch {
        return [id, text];
      }
    }
    throw new Error(await response.text());
  };
};

export default createBridge;
