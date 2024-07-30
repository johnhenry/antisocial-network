import type { Handler } from "@/types/tools";
import ivm from "isolated-vm";
import indenturedServant from "@/lib/util/indentured-savant";
const indent = indenturedServant(2);
const handler: Handler = ({
  code,
}: {
  code:string;
}): string => {
    try {
      const isolate = new ivm.Isolate({ memoryLimit: 128 });
      // Create a new context within this isolate. Each context has its own copy of all the builtin
      // Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
      // other contexts.
      const context = isolate.createContextSync();

      // Get a Reference{} to the global object within the context.
      const jail = context.global;

      // This makes the global object available in the context as `global`. We use `derefInto()` here
      // because otherwise `global` would actually be a Reference{} object in the new isolate.
      jail.setSync('global', jail.derefInto());

      // We will create a basic `log` function for the new isolate to use.
      const logs:string[] = [];
      const errors:string[] = [];

      jail.setSync('log', (...args:any[]) =>{
        args.unshift(String(Date.now()));
        logs.push((args.join(" ")));
      });
      jail.setSync('log', (...args:any[]) =>{
        args.unshift(String(Date.now()));
        errors.push((args.join(" ")));
      });


      const out =[
      `The output of running the code:
\`\`\`javascript
${`${indent`${code}`}`}
\`\`\``];

      const result = context.evalSync(code);
      if(result){
        out.push(`- result:
\`\`\`
${`${indent`${result}`}`}
\`\`\``)
      }

      if(logs.length){
        out.push(`- logs:
\`\`\`
${indent`${logs.join("\n")}`}
\`\`\``);
      }

      if(errors.length){
        out.push(`- errors:
\`\`\`
${indent`${errors.join("\n")}`}
\`\`\``);
      }
      return out.join("\n\n");
    } catch(error) {
      return `Error: ${error}`;
    }
}

export default handler