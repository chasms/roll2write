import { useState } from "react";
import { v4 as uuid } from "uuid";
import { css, cva } from "../../styled-system/css";
import type { DieDefinition, DiePattern } from "../domain/types";
import { DIE_PATTERNS, DIE_SIDE_PRESETS } from "../domain/types";
import { validateNewDie } from "../domain/validation";
import { DieThumbnail } from "./DieThumbnail";

interface DiceFormModalProps {
  existingNames: string[];
  onClose: () => void;
  onCreated?: (die: DieDefinition) => void;
  onUpdated?: (die: DieDefinition) => void;
  die?: DieDefinition; // if provided, edit mode
}

function generateRandomHex() {
  // Generate a random integer between 0 and 16777215 (FFFFFF in hex)
  const randomNumber = Math.floor(Math.random() * 16777215);

  // Convert the number to a hexadecimal string
  let hexString = randomNumber.toString(16);

  // Pad with leading zeros if necessary to ensure 6 characters
  while (hexString.length < 6) {
    hexString = "0" + hexString;
  }

  // Prepend '#' for a valid hex color code
  return "#" + hexString;
}

export function DiceFormModal({
  existingNames,
  onClose,
  onCreated,
  onUpdated,
  die,
}: DiceFormModalProps) {
  const editMode = !!die;
  const [name, setName] = useState(die?.name ?? "");
  const [sides, setSides] = useState<number>(die?.sides ?? 6);
  const [customSides, setCustomSides] = useState<string>("");
  const effectiveSides = customSides ? Number(customSides) || 0 : sides;
  const [options, setOptions] = useState<string[]>(die ? [...die.options] : Array(6).fill(""));
  const [colorHex, setColorHex] = useState(die?.colorHex ?? generateRandomHex());
  const [pattern, setPattern] = useState<DiePattern>(die?.pattern ?? "solid");
  const [errors, setErrors] = useState<string[]>([]);

  const sidePresetButtonClass = cva({
    base: {
      px: 2,
      py: 1,
      mr: 2,
      mb: 2,
      rounded: "sm",
    },
    variants: {
      selected: {
        true: { bg: "gray.700", color: "white" },
        false: { bg: "gray.200", color: "black" },
      },
    },
  });

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
  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const newDie = {
      name,
      sides: effectiveSides,
      options,
      colorHex,
      pattern,
    };

    const validation = validateNewDie(newDie, existingNames);

    if (!validation.ok) {
      setErrors(validation.issues.map((i) => i.message));
      return;
    }

    const now = new Date().toISOString();

    if (die) {
      const updated: DieDefinition = {
        ...die,
        ...validation.value,
        sides: effectiveSides,
        options,
        colorHex,
        pattern,
        updatedAt: now,
      };
      onUpdated?.(updated);
    } else {
      const newDie: DieDefinition = {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        ...validation.value,
        sides: effectiveSides,
        options,
        colorHex,
        pattern,
      };
      onCreated?.(newDie);
    }
    onClose();
  }

  const previewDie: DieDefinition = {
    id: die?.id ?? "preview-id",
    name: name || (editMode ? die.name || "(unnamed)" : "Preview"),
    sides: effectiveSides || 6,
    options,
    createdAt: die?.createdAt ?? "",
    updatedAt: die?.updatedAt ?? "",
    colorHex,
    pattern,
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        p: 4,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      })}
    >
      <form
        onSubmit={handleSave}
        className={css({
          bg: "transparent",
          color: "black",
          rounded: "md",
          p: 6,
          maxW: "800px",
          w: "full",
          maxH: "90vh",
          overflowY: "auto",
          display: "grid",
          gap: 6,
          gridTemplateColumns: { base: "1fr", md: "1fr 1fr" },
        })}
      >
        <div>
          <h2 className={css({ fontSize: "2xl", mb: 4 })}>
            {editMode ? "Edit Die" : "Create Die"}
          </h2>
          <label className={css({ display: "block", mb: 2 })}>
            Name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={css({ border: "1px solid", w: "full", px: 2, py: 1 })}
            />
          </label>
          <div className={css({ mb: 3 })}>
            <span>Sides: </span>
            {DIE_SIDE_PRESETS.map((preset) => {
              const selected = sides === preset && !customSides;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    updateSides(preset);
                  }}
                  className={sidePresetButtonClass({ selected })}
                >
                  d{preset}
                </button>
              );
            })}
            <input
              placeholder="Custom"
              value={customSides}
              onChange={(e) => {
                updateCustomSides(e.target.value);
              }}
              className={css({ border: "1px solid", px: 2, py: 1, w: 28 })}
            />
          </div>
          <div className={css({ mb: 4 })}>
            <label className={css({ display: "block", mb: 2 })}>
              Color
              <input
                type="color"
                value={colorHex}
                onChange={(e) => {
                  setColorHex(e.target.value);
                }}
                className={css({ w: 16, h: 10, p: 0, border: "1px solid" })}
              />
            </label>
            <fieldset className={css({ border: "1px solid", p: 3, rounded: "sm" })}>
              <legend className={css({ px: 1 })}>Pattern</legend>
              <div className={css({ display: "flex", flexWrap: "wrap", gap: 2 })}>
                {DIE_PATTERNS.map((p) => (
                  <label
                    key={p}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    })}
                  >
                    <input
                      type="radio"
                      name="pattern"
                      value={p}
                      checked={pattern === p}
                      onChange={() => {
                        setPattern(p);
                      }}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div
            className={css({
              maxH: 64,
              overflowY: "auto",
              border: "1px solid",
              p: 2,
              mb: 4,
            })}
          >
            {options.map((opt, i) => (
              <label
                key={i}
                className={css({
                  display: "flex",
                  mb: 2,
                  alignItems: "center",
                })}
              >
                <span className={css({ w: 10 })}>{i + 1}</span>
                <input
                  value={opt}
                  placeholder={"Option " + (i + 1).toString()}
                  onChange={(e) => {
                    updateOption(i, e.target.value);
                  }}
                  className={css({
                    flex: 1,
                    border: "1px solid",
                    px: 2,
                    py: 1,
                  })}
                />
              </label>
            ))}
          </div>
          {errors.length > 0 && (
            <ul className={css({ color: "red.600", mb: 4 })}>
              {errors.map((er, i) => (
                <li key={i}>{er}</li>
              ))}
            </ul>
          )}
          <div className={css({ display: "flex", gap: 3 })}>
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
              {editMode ? "Update Die" : "Save Die"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={css({
                px: 4,
                py: 2,
                bg: "gray.500",
                color: "white",
                rounded: "sm",
              })}
            >
              Cancel
            </button>
          </div>
        </div>
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <DieThumbnail die={previewDie} showOption={null} />
        </div>
      </form>
    </div>
  );
}
