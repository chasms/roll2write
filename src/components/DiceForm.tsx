import { useState } from "react";
import { v4 as uuid } from "uuid";
import { css, cva } from "../../styled-system/css";
import { DIE_SIDE_PRESETS, type DieDefinition } from "../domain/types";
import { validateNewDie } from "../domain/validation";

interface DiceFormProps {
  existingDiceNames: string[];
  onCreated: (die: DieDefinition) => void;
}

const sidePresetButtonClass = cva({
  base: { mr: 2, mb: 2, px: 2, py: 1, rounded: "sm" },
  variants: {
    selected: {
      true: { bg: "gray.700", color: "white" },
      false: { bg: "gray.200", color: "black" },
    },
  },
  defaultVariants: { selected: false },
});

export function DiceForm({ existingDiceNames, onCreated }: DiceFormProps) {
  const [name, setName] = useState("");
  const [sides, setSides] = useState<number>(6);
  const [customSides, setCustomSides] = useState<string>("");
  const effectiveSides = customSides ? Number(customSides) || 0 : sides;
  const [options, setOptions] = useState<string[]>(Array(6).fill(""));
  // Use Partial so property lookups can be undefined, satisfying conditional rendering checks.
  const [errors, setErrors] = useState<Partial<Record<string, string[]>>>({});

  function updateSides(n: number) {
    setSides(n);
    setCustomSides("");
    setOptions(Array(n).fill(""));
  }
  function updateCustomSides(raw: string) {
    setCustomSides(raw);
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 2 && n <= 200) {
      setOptions(Array(n).fill(""));
    }
  }
  function updateOption(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateNewDie({
      name,
      sides: effectiveSides,
      options,
      existingNames: existingDiceNames,
    });
    if (!result.ok) {
      const grouped: Record<string, string[]> = {};
      for (const issue of result.issues) {
        const list = grouped[issue.field] ?? (grouped[issue.field] = []);
        list.push(issue.message);
      }
      setErrors(grouped);
      return;
    }
    const now = new Date().toISOString();
    const die: DieDefinition = {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      ...result.value,
    };
    onCreated(die);
    setName("");
    updateSides(6);
    setErrors({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={css({ border: "1px solid", p: 4, rounded: "md", mb: 4 })}
    >
      <h2>Create Die</h2>
      <label className={css({ display: "block", mb: 2 })}>
        Name
        <input
          className={css({ border: "1px solid", px: 2, py: 1, w: "full" })}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </label>
      {errors.name && errors.name.length > 0 && (
        <p className={css({ color: "red.500" })}>{errors.name.join(", ")}</p>
      )}
      <div className={css({ mb: 2 })}>
        <span>Sides: </span>
        {DIE_SIDE_PRESETS.map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => {
              updateSides(n);
            }}
            className={sidePresetButtonClass({
              selected: sides === n && !customSides,
            })}
          >
            d{n}
          </button>
        ))}
        <input
          placeholder="Custom"
          value={customSides}
          onChange={(e) => {
            updateCustomSides(e.target.value);
          }}
          className={css({ border: "1px solid", px: 2, py: 1, w: 24 })}
        />
      </div>
      {errors.sides && errors.sides.length > 0 && (
        <p className={css({ color: "red.500" })}>{errors.sides.join(", ")}</p>
      )}
      <div
        className={css({
          maxH: 64,
          overflowY: "auto",
          mb: 4,
          border: "1px solid",
          p: 2,
        })}
      >
        {options.map((opt, i) => (
          <label
            key={i}
            className={css({ display: "flex", alignItems: "center", mb: 1 })}
          >
            <span className={css({ w: 10 })}>{i + 1}</span>
            <input
              value={opt}
              onChange={(e) => {
                updateOption(i, e.target.value);
              }}
              className={css({ flex: 1, border: "1px solid", px: 2, py: 1 })}
              placeholder={"Option " + (i + 1).toString()}
            />
          </label>
        ))}
      </div>
      {errors.options && errors.options.length > 0 && (
        <p className={css({ color: "red.500" })}>{errors.options.join(", ")}</p>
      )}
      <button
        type="submit"
        className={css({
          px: 4,
          py: 2,
          bg: "blue.600",
          color: "white",
          rounded: "sm",
        })}
      >
        Save Die
      </button>
    </form>
  );
}
