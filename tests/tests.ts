import { suite } from "uvu";
import * as assert from "uvu/assert";
import fs from "fs";

import { prismaToZod } from "../src/index";

const prismaSchema = fs.readFileSync("tests/schema.prisma", {
  encoding: "utf-8",
});
let expected = fs.readFileSync("tests/expected.ts", { encoding: "utf-8" });

const test = suite("prisma-to-zod");

test("Generated output", () => {
  const output = prismaToZod(prismaSchema);
  // Uncomment when generator has been updated
  //fs.writeFileSync("tests/expected.ts", (expected = output));
  assert.fixture(output, expected);
});

test.run();
