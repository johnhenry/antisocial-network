export type JSONExtended<T = never> =
  | T
  | string
  | number
  | boolean
  | null
  | JSONExt<T>[]
  | { [key: string]: JSONExt<T> };

export type JSONExtendedPlain<T = never> =
  | T
  | string
  | number
  | boolean
  | null
  | JSONExt<T>[];

export interface JSONExtendedObject<T = never> {
  [k: string]: JSONExtended;
}
export interface JSONExtendedArray<T = never> extends Array<JSONExtended<T>> {}

export default JSONExtended;
