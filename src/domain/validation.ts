import type { DieDefinition, ValidationIssue, ValidationResult } from "./types";

interface NewDieInput {
  name: string;
  sides: number;
  options: string[];
  existingNames: string[];
}

export function validateNewDie(
  input: NewDieInput,
): ValidationResult<Omit<DieDefinition, "id" | "createdAt" | "updatedAt">> {
  const issues: ValidationIssue[] = [];
  const name = input.name.trim();
  if (!name) issues.push({ field: "name", message: "Name is required" });
  if (
    input.existingNames.map((n) => n.toLowerCase()).includes(name.toLowerCase())
  ) {
    issues.push({ field: "name", message: "Name must be unique" });
  }
  const sides = input.sides;
  if (!Number.isInteger(sides) || sides < 2) {
    issues.push({ field: "sides", message: "Sides must be an integer >= 2" });
  }
  if (input.options.length !== sides) {
    issues.push({
      field: "options",
      message: "Need exactly " + String(sides) + " options",
    });
  }
  const trimmed = input.options.map((o) => o.trim());
  if (trimmed.some((o) => !o)) {
    issues.push({ field: "options", message: "Options may not be blank" });
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true, value: { name, sides, options: trimmed } };
}
