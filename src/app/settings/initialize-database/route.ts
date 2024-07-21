import initDB from "@/script/init-db";
const START_MESSAGE = "initializing database";
const END_MESSAGE = "database initialized";
const { log } = console;
export const POST = async () => {
  try {
    log(START_MESSAGE);
    await initDB();
    // accepte response
    log(END_MESSAGE);
    return new Response(END_MESSAGE, { status: 202 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
};
export const dynamic = "force-dynamic";
