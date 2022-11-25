# prisma-to-zod

Simple generator of [Zod](https://zod.dev/) validation schemas from [Prisma](https://www.prisma.io/) schemas.

The generated file exports schemas according to the name of the Prisma models, with type guards for missing keys when the schema evolves.

## Installation

```bash
(p)npm install -D prisma-to-zod
```

## Usage

```bash
p2z prisma/schema.prisma [output.ts]
```

Will generate a typescript file, ready for additional validations.

If no output file is specified, the schema will be written to stdout.

**NOTE:** This is currently a one-time process, since any additional generation will overwrite your modifications. A future version will update the schema without overwriting.

### Programmatically

```js
import { prismaToZod } from "prisma-to-zod";
import fs from "fs";

const schema = fs.readFileSync("prisma/schema.prisma", { encoding: "utf8" });

console.log(prismaToZod(schema));
```

Suggestions, improvements, PRs, are welcome at the [github repo](https://github.com/ciscoheat/prisma-to-zod).
