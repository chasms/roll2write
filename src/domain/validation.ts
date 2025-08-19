import type { DieDefinition, ValidationIssue, ValidationResult } from "./types";

type NewDieInput = Omit<DieDefinition, "id" | "createdAt" | "updatedAt">;

export function validateNewDie(
  dieInput: NewDieInput,
  existingNames: string[],
): ValidationResult<NewDieInput> {
  const issues: ValidationIssue[] = [];

  const name = dieInput.name.trim();

  if (!name) issues.push({ field: "name", message: "Name is required" });

  if (existingNames.map((n) => n.toLowerCase()).includes(name.toLowerCase())) {
    issues.push({ field: "name", message: "Name must be unique" });
  }

  const sides = dieInput.sides;

  if (!Number.isInteger(sides) || sides < 2) {
    issues.push({ field: "sides", message: "Sides must be an integer >= 2" });
  }

  if (dieInput.options.length !== sides) {
    issues.push({
      field: "options",
      message: "Need exactly " + String(sides) + " options",
    });
  }

  const trimmed = dieInput.options.map((o) => o.trim());

  if (trimmed.some((o) => !o)) {
    issues.push({ field: "options", message: "Options may not be blank" });
  }

  if (issues.length) return { ok: false, issues };

  return { ok: true, value: { ...dieInput, name, sides, options: trimmed } };
}
