import initDB from "@/script/init-db";

export const dynamic = "force-dynamic";
export const POST = async () => {
  try {
    console.log("Initializing DB.");
    await initDB();
    // accepte response
    console.log("DB initialized.");
    return new Response("initialized", { status: 202 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
};
