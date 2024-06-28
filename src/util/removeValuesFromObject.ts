const removeValuesFromObject = (obj: Record<string, any>, ...values: any[]) => {
  const has: Set<any> = new Set(values);
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => !has.has(v))
  );
};
export default removeValuesFromObject;
