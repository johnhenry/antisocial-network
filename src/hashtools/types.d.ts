export type Descriptor = {
  name: string[] | string;
  description: string;
};
export type Handler = (...args: any[]) => any;
export type DescriptorFull = Descriptor & { handler: Handler, name:string };
