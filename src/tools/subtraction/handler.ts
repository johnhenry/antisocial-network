import type { Handler } from "@/types/tools";

const handler: Handler = ({
  minuend,
  subtrahend,
}: {
  minuend: number;
  subtrahend: number;
}): string => {
  return `${minuend} minus ${subtrahend} is ${minuend - subtrahend}`;
};

export default handler;
