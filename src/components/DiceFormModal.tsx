import { useState } from "react";
import { v4 as uuid } from "uuid";
import { css } from "../../styled-system/css";
import { APPEARANCE_PRESETS } from "../domain/appearancePresets";
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

export function DiceFormModal({ existingNames, onClose, onCreated, onUpdated, die }: DiceFormModalProps) {
  const editMode = !!die;
  const [activeTab, setActiveTab] = useState<"basic" | "appearance">("basic");
  const [name, setName] = useState(die?.name ?? "");
  const [sides, setSides] = useState<number>(die?.sides ?? 6);
  const [options, setOptions] = useState<string[]>(die ? [...die.options] : Array(6).fill(""));
  const [colorHex, setColorHex] = useState(die?.colorHex ?? generateRandomHex());
  const [pattern, setPattern] = useState<DiePattern>(die?.pattern ?? "solid");
  const [errors, setErrors] = useState<string[]>([]);
  const [appearance, setAppearance] = useState<DieDefinition["appearance"]>(
    die?.appearance ?? {
      roughness: 0.55,
      metalness: 0.15,
      reflectivity: 0.5,
      transmission: 0,
      ior: 1.3,
      thickness: 0.2,
      attenuationDistance: 0,
      attenuationColor: colorHex,
      opacity: 1,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
      sheen: 0,
      sheenColor: colorHex,
      sparkleIntensity: 0,
      sparkleCount: 40,
      sparkleColor: "#ffffff",
    }
  );
  const originalName = die?.name ?? "";

  // When sides changes (preset), reset options length
  function updateSides(n: number) {
    setSides(n);
    setOptions(Array(n).fill(""));
  }

  function updateOption(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const filteredNames = editMode
      ? existingNames.filter((n) => n.toLowerCase() !== originalName.toLowerCase())
      : existingNames;
    const validation = validateNewDie(
      {
        name,
        sides,
        options,
        colorHex,
        pattern,
        appearance,
      },
      filteredNames
    );
    if (!validation.ok) {
      setErrors(validation.issues.map((i) => i.message));
      return;
    }
    const now = new Date().toISOString();
    if (editMode) {
      const updated: DieDefinition = {
        id: die.id,
        createdAt: die.createdAt,
        updatedAt: now,
        ...validation.value,
      };
      onUpdated?.(updated);
    } else {
      const created: DieDefinition = {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        ...validation.value,
      };
      onCreated?.(created);
    }
    onClose();
  }

  const previewDie: DieDefinition = {
    id: die?.id ?? "preview",
    name: name || (editMode ? originalName : "Preview"),
    sides,
    options: options.map((o, i) => o || "Option " + String(i + 1)),
    createdAt: die?.createdAt ?? "",
    updatedAt: die?.updatedAt ?? "",
    colorHex,
    pattern,
    appearance,
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        p: 6,
      })}
      style={{
        backdropFilter: "blur(14px)",
        background: "radial-gradient(circle at 20% 30%, rgba(123,93,249,0.25), transparent 70%)",
      }}
    >
      <form
        onSubmit={handleSave}
        className={css({
          rounded: "lg",
          p: 8,
          maxW: "1000px",
          w: "full",
          maxH: "90vh",
          overflowY: "auto",
          display: "grid",
          gap: 8,
          gridTemplateColumns: { base: "1fr" },
        })}
        style={{
          background: "rgba(255,255,255,0.06)",
          color: "#ebe5d7",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 0 28px -6px rgba(123,93,249,0.7)",
          backdropFilter: "blur(22px)",
        }}
      >
        <div>
          {/* Sticky header with title, preview, and tabs */}
          <div
            className={css({
              position: "sticky",
              top: 0,
              zIndex: 5,
              pb: 2,
              mb: 2,
              backdropFilter: "blur(30px) saturate(140%)",
            })}
            style={{
              background: "linear-gradient(rgba(18,15,25,0.78), rgba(18,15,25,0.72))",
              boxShadow: "0 2px 6px -2px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 4,
                mb: 2,
              })}
            >
              <h2
                className={css({ fontSize: "2xl", fontWeight: "semibold", letterSpacing: "0.5px", m: 0 })}
                style={{
                  backgroundImage: "linear-gradient(90deg,#7b5df9 0%, #c184ff 50%, #8bd6ff 100%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {editMode ? "Edit Die" : "Create Die"}
              </h2>
              <div className={css({ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
                <DieThumbnail die={previewDie} showOption={null} size={110} />
              </div>
            </div>
            <div className={css({ display: "flex", gap: 2, pt: 1 })} role="tablist" aria-label="Die editor sections">
              {[
                { key: "basic", label: "Basics" },
                { key: "appearance", label: "Appearance" },
              ].map((t) => {
                const selected = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`dice-tabpanel-${t.key}`}
                    id={`dice-tab-${t.key}`}
                    onClick={() => {
                      setActiveTab(t.key as typeof activeTab);
                    }}
                    className={css({
                      px: 4,
                      py: 2,
                      fontSize: "sm",
                      rounded: "sm",
                      cursor: "pointer",
                      position: "relative",
                      border: "1px solid",
                    })}
                    style={
                      selected
                        ? {
                            borderColor: "rgba(255,255,255,0.35)",
                            background: "rgba(255,255,255,0.18)",
                            boxShadow:
                              "0 0 0 1px rgba(0,0,0,0.45), 0 0 0 1px inset rgba(255,255,255,0.25), 0 6px 22px -6px rgba(123,93,249,0.8)",
                          }
                        : { borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "basic" && (
            <div id="dice-tabpanel-basic" role="tabpanel" aria-labelledby="dice-tab-basic">
              <label className={css({ display: "block", mb: 4 })}>
                <span className={css({ display: "block", mb: 1 })}>Name</span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={css({ w: "full", border: "1px solid", px: 3, py: 2 })}
                />
              </label>
              <fieldset
                className={css({ border: "1px solid", p: 3, rounded: "sm", mb: 6 })}
                style={{ borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}
              >
                <legend className={css({ px: 1, fontSize: "sm", letterSpacing: "0.5px", textTransform: "uppercase" })}>
                  Sides
                </legend>
                <div className={css({ display: "flex", flexWrap: "wrap", gap: 2 })}>
                  {DIE_SIDE_PRESETS.map((preset) => {
                    const selected = sides === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          updateSides(preset);
                        }}
                        className={css({
                          px: 3,
                          py: 2,
                          fontSize: "sm",
                          rounded: "sm",
                          border: "1px solid",
                          cursor: "pointer",
                        })}
                        style={
                          selected
                            ? {
                                background: "#4a2ed6",
                                color: "white",
                                borderColor: "rgba(255,255,255,0.4)",
                                boxShadow:
                                  "0 0 0 1px rgba(0,0,0,0.4), 0 0 14px -2px rgba(123,93,249,0.6), inset 0 0 0 1px rgba(255,255,255,0.25)",
                              }
                            : {
                                background: "rgba(255,255,255,0.15)",
                                color: "#ebe5d7",
                                borderColor: "rgba(255,255,255,0.25)",
                              }
                        }
                      >
                        d{preset}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div
                className={css({ maxH: 64, overflowY: "auto", p: 2, mb: 6 })}
                style={{ border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}
              >
                {options.map((opt, i) => (
                  <label key={i} className={css({ display: "flex", mb: 2, alignItems: "center" })}>
                    <span className={css({ w: 10 })}>{i + 1}</span>
                    <input
                      value={opt}
                      placeholder={`Option ${(i + 1).toString()}`}
                      onChange={(e) => {
                        updateOption(i, e.target.value);
                      }}
                      className={css({ flex: 1, border: "1px solid", px: 2, py: 1 })}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div id="dice-tabpanel-appearance" role="tabpanel" aria-labelledby="dice-tab-appearance">
              <div className={css({ mb: 4 })}>
                <label className={css({ display: "block", mb: 4 })}>
                  <span className={css({ display: "block", mb: 1 })}>Base Color</span>
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => {
                      const v = e.target.value;
                      setColorHex(v);
                      setAppearance((prev) => ({ ...prev, attenuationColor: v, sheenColor: v }));
                    }}
                    className={css({ w: 16, h: 10, p: 0, border: "1px solid" })}
                  />
                </label>
                <fieldset
                  className={css({ border: "1px solid", p: 3, rounded: "sm", mb: 5 })}
                  style={{ borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}
                >
                  <legend
                    className={css({ px: 1, fontSize: "sm", letterSpacing: "0.5px", textTransform: "uppercase" })}
                  >
                    Presets
                  </legend>
                  <div className={css({ display: "flex", flexWrap: "wrap", gap: 2 })}>
                    {APPEARANCE_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        className={css({
                          px: 2,
                          py: 1,
                          fontSize: "xs",
                          rounded: "sm",
                          cursor: "pointer",
                          border: "1px solid",
                        })}
                        style={{ borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.10)" }}
                        onClick={() => {
                          setColorHex(p.colorHex);
                          setPattern(p.pattern ?? pattern);
                          setAppearance({ ...p.appearance });
                        }}
                        title={p.description}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className={css({ border: "1px solid", p: 3, rounded: "sm", mb: 5 })}>
                  <legend
                    className={css({ px: 1, fontSize: "sm", letterSpacing: "0.5px", textTransform: "uppercase" })}
                  >
                    Pattern
                  </legend>
                  <div className={css({ display: "flex", flexWrap: "wrap", gap: 2 })}>
                    {DIE_PATTERNS.map((p) => (
                      <label key={p} className={css({ display: "flex", alignItems: "center", gap: 1 })}>
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
                <fieldset
                  className={css({ border: "1px solid", p: 4, rounded: "sm" })}
                  style={{ borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}
                >
                  <legend
                    className={css({ px: 1, fontSize: "sm", letterSpacing: "0.5px", textTransform: "uppercase" })}
                  >
                    Material
                  </legend>
                  <div className={css({ display: "grid", gap: 2 })}>
                    {(
                      [
                        ["roughness", 0, 1, 0.01],
                        ["metalness", 0, 1, 0.01],
                        ["reflectivity", 0, 1, 0.01],
                        ["transmission", 0, 1, 0.01],
                        ["ior", 1, 2.5, 0.01],
                        ["thickness", 0, 5, 0.05],
                        ["attenuationDistance", 0, 10, 0.1],
                        ["opacity", 0, 1, 0.01],
                        ["clearcoat", 0, 1, 0.01],
                        ["clearcoatRoughness", 0, 1, 0.01],
                        ["sheen", 0, 1, 0.01],
                        ["sparkleIntensity", 0, 1, 0.01],
                        ["sparkleCount", 0, 400, 1],
                      ] as const
                    ).map(([key, min, max, step]) => (
                      <label key={key} className={css({ display: "flex", flexDirection: "column", fontSize: "xs" })}>
                        <span>
                          {key}: {appearance?.[key] ?? 0}
                        </span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={appearance?.[key] ?? 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setAppearance((prev) => ({ ...prev, [key]: value }));
                          }}
                        />
                      </label>
                    ))}
                    <label className={css({ display: "flex", flexDirection: "column", fontSize: "xs" })}>
                      attenuationColor
                      <input
                        type="color"
                        value={appearance?.attenuationColor ?? colorHex}
                        onChange={(e) => {
                          setAppearance((prev) => ({ ...prev, attenuationColor: e.target.value }));
                        }}
                      />
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", fontSize: "xs" })}>
                      sheenColor
                      <input
                        type="color"
                        value={appearance?.sheenColor ?? colorHex}
                        onChange={(e) => {
                          setAppearance((prev) => ({ ...prev, sheenColor: e.target.value }));
                        }}
                      />
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", fontSize: "xs" })}>
                      sparkleColor
                      <input
                        type="color"
                        value={appearance?.sparkleColor ?? "#ffffff"}
                        onChange={(e) => {
                          setAppearance((prev) => ({ ...prev, sparkleColor: e.target.value }));
                        }}
                      />
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <ul className={css({ color: "red.500", mb: 4 })}>
              {errors.map((er, i) => (
                <li key={i}>{er}</li>
              ))}
            </ul>
          )}
          <div className={css({ display: "flex", gap: 4, mt: 4 })}>
            <button
              type="submit"
              className={css({ px: 5, py: 3, rounded: "sm", fontWeight: "medium" })}
              style={{
                background: "linear-gradient(90deg,#7b5df9,#c184ff,#8bd6ff)",
                color: "#120f19",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 4px 18px -4px rgba(123,93,249,0.7)",
              }}
            >
              {editMode ? "Update Die" : "Save Die"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={css({ px: 5, py: 3, rounded: "sm" })}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#ebe5d7",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
