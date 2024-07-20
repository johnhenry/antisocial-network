export type JSONExt<V = never> =
  | V
  | string
  | number
  | boolean
  | null
  | JSONExt<V>[]
  | { [key: string]: JSONExt<V> };

export interface JSONObject {
  [k: string]: JSONExt;
}
export interface JSONArray extends Array<JSONExt> {}
