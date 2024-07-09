import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

console.log(5, process.argv);

const args = yargs(process.argv).argv;
console.log(10, args);

console.log(12, hideBin(process.argv));

const result = yargs(hideBin(process.argv))
  .command(
    "curl <url>",
    "fetch the contents of the URL",
    (x) => {
      console.log(14, x);
    },
    (argv) => {
      console.log(15, argv);
    }
  )
  .demandCommand(1)
  .parse();
console.log(20, result);

throw new Error("Not implemented");
