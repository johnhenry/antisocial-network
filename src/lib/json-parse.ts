type ObjectWithId = Object & { id: any };
type ObjectWithStringId = Object & { id: string };
const parse = (object: ObjectWithId): ObjectWithStringId => {
  return { ...object, id: object.id.toString() };
};
export default parse;
