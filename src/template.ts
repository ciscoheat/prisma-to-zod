export const template = (
  identifier: string,
  types: [string, Record<string, string>][],
  consts: Record<string, string>
) =>
  `
// Auto-generated by prisma-to-zod

// <P2Z> This will be replaced by generated code
import { ${identifier} } from 'zod';
import type { ZodRawShape } from 'zod';
import type { ${types.map((t) => t[0]).join(", ")} } from '@prisma/client';
// </P2Z>

// This code is safe to edit and modify

${Object.entries(consts)
  .map(([name, code]) => `const ${name} = ${code};`)
  .join("\n")}

${types.map(([name, object]) => schema(name, object)).join("\n\n")}

// <P2Z> This will be replaced by generated code
type ExactKeys<Shape, T> = keyof Shape extends keyof T
  ? keyof T extends keyof Shape
    ? T
    : never
  : never;

function schema<Shape, Other extends ZodRawShape>(obj: ExactKeys<Shape, Other>) {
  return ${identifier}.object(obj);
}

${types.map(([name]) => exportVar(name)).join("\n")}
// </P2Z>
`.trim();

/////////////////////////////////////////////////////////////////////

const schema = (name: string, object: Record<string, string>) => {
  return `
const ${name} = {
  ${Object.entries(object)
    .map(([key, value]) => `${key}: ${value}`)
    .join(",\n  ")}
};`.trim();
};

const exportVar = (name: string) => {
  const schema = `${name}Schema`;
  const exportVar = schema.charAt(0).toLowerCase() + schema.slice(1);
  return `export const ${exportVar} = schema<${name}, typeof ${name}>(${name});`.trim();
};
