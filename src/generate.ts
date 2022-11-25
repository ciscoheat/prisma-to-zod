import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import type {
  ModelDeclaration,
  FieldDeclaration,
} from "@loancrate/prisma-schema-parser";
import { template } from "./template";

const baseTypes = new Map([
  ["Boolean", "boolean()"],
  ["DateTime", "date()"],
  ["Decimal", "number()"],
  ["Int", "number()"],
  ["String", "string()"],
]);

const nameModifiers = new Map([
  ["email", "email()"],
  ["slug", "regex(/^[a-z0-9][a-z0-9-.]+$/)"],
]);

const identifier = "z";

const consts = [["intId", "z.number().positive()"]] as [string, string][];

/////////////////////////////////////////////////////////////////////

const fieldToZod = (member: FieldDeclaration) => {
  const optional = member.type.kind == "optional";
  const name = member.name.value;

  let output: string[] = [identifier];
  let type = "";

  if (member.type.kind == "typeId") {
    type = member.type.name.value;
  } else if (
    member.type.kind == "optional" &&
    member.type.type.kind == "typeId"
  ) {
    type = member.type.type.name.value;
  }

  if (!baseTypes.has(type)) {
    //console.log('Skipping field: ' + member.name.value);
    return null;
  }

  output.push(baseTypes.get(type) as string);

  if (nameModifiers.has(name)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    output.push(nameModifiers.get(name)!);
  } else if (type == "Int" && (name == "id" || name.endsWith("Id"))) {
    output = ["intId"];
  }

  if (optional) output.push("nullable()");

  return [name, output.join(".")];
};

const modelToZod = (model: ModelDeclaration) => {
  return [
    model.name.value,
    Object.fromEntries(
      model.members
        .filter((m) => m.kind == "field")
        .map((m) => fieldToZod(m as FieldDeclaration))
        .filter((m) => m) as [string, string][]
    ),
  ] as [string, Record<string, string>];
};

export const prismaToZod = (prismaSchema: string) => {
  const ast = parsePrismaSchema(prismaSchema);

  const models = ast.declarations.filter(
    (d) => d.kind === "model"
  ) as ModelDeclaration[];

  return template(models.map(modelToZod), consts);
};
