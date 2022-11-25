import { prismaToZod } from "./index.js";
import minimist from "minimist";
import c from "ansi-colors";
import fs from "fs/promises";

const log = (msg: string) =>
  console.log(process.stdout.isTTY ? msg : c.unstyle(msg));

const args = minimist(process.argv.slice(2), { boolean: true });

process.on("uncaughtException", (err) => {
  const msg = err.message.startsWith("Error: ")
    ? err.message.substring("Error: ".length)
    : err.message;
  log(c.red("Error: ") + msg);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  err = err.toString();
  const msg = err.startsWith("Error: ") ? err.substring("Error: ".length) : err;
  log(c.red("Error: ") + msg);
  process.exit(1);
});

/////////////////////////////////////////////////////////////////////

const help = () =>
  console.log(
    `
Usage: p2z input.prisma [output.ts]

If no output file is specified, output goes to stdout.
`.trim()
  );

if (args["help"] || args._.length == 0) {
  help();
} else {
  const schema = await fs.readFile(args._[0] as string, { encoding: "utf8" });
  const generated = prismaToZod(schema);

  if (args._[1]) {
    await fs.writeFile(args._[1], generated, { encoding: "utf8" });
  } else {
    process.stdout.write(generated);
  }
}
