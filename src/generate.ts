import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import type {
  ModelDeclaration,
  FieldDeclaration,
} from "@loancrate/prisma-schema-parser";
import { template } from "./template.js";

/////////////////////////////////////////////////////////////////////

const identifier = "z";

const baseTypes = new Map([
  ["Boolean", "boolean()"],
  ["DateTime", "date()"],
  ["Decimal", "number()"],
  ["Int", "number()"],
  ["String", "string()"],
]);

const nameModifiers = new Map([
  ["email", "email()"],
  ["slug", "regex(/^[a-z0-9][a-z0-9-]+$/)"],
]);

const exportConsts = { intId: `${identifier}.number().positive()` };

/////////////////////////////////////////////////////////////////////

export function prismaToZod(prismaSchema: string) {
  const ast = parsePrismaSchema(prismaSchema);

  const models = ast.declarations.filter(
    (d) => d.kind === "model"
  ) as ModelDeclaration[];

  return template(identifier, models.map(modelToZod), exportConsts);

  /////////////////////////////////////////////////////////

  function modelToZod(model: ModelDeclaration) {
    return [
      model.name.value,
      Object.fromEntries(
        model.members
          .filter((m) => m.kind == "field")
          .map((m) => fieldToZod(m as FieldDeclaration))
          .filter((m) => m) as [string, string][]
      ),
    ] as [string, Record<string, string>];

    /////////////////////////////////////////////

    function fieldToZod(member: FieldDeclaration) {
      const useConst = (name: keyof typeof exportConsts) => name;

      const name = member.name.value;
      const isOptional = member.type.kind == "optional";

      // Set the type
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
        return null;
      }

      let output: string[] = [identifier, baseTypes.get(type) as string];

      // Simplify if primary key is int
      if (type == "Int" && (name == "id" || name.endsWith("Id"))) {
        output = [useConst("intId")];
      }

      // Add modifiers
      if (nameModifiers.has(name)) {
        output.push(nameModifiers.get(name)!);
      }

      // Check for nullable
      if (isOptional) {
        output.push("nullable()");
      }

      return [name, output.join(".")];
    }
  }
}
