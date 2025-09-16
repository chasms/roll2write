import { classNamesFunc } from "classnames-generics";
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { APPEARANCE_PRESETS } from "../domain/appearancePresets";
import type { DieDefinition, DiePattern } from "../domain/types";
import { DIE_PATTERNS, DIE_SIDE_PRESETS } from "../domain/types";
import { validateNewDie } from "../domain/validation";
import styles from "./DiceFormModal.module.scss";
import { DieThumbnail } from "./DieThumbnail";

interface DiceFormModalProps {
  existingNames: string[];
  onClose: () => void;
  onCreated?: (die: DieDefinition) => void;
  onUpdated?: (die: DieDefinition) => void;
  die?: DieDefinition; // if provided, edit mode
}

const classNames = classNamesFunc<keyof typeof styles>();

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
  const [activeTab, setActiveTab] = useState<"basic" | "appearance">("basic");
  const [name, setName] = useState(die?.name ?? "");
  const [sides, setSides] = useState<number>(die?.sides ?? 6);
  const [options, setOptions] = useState<string[]>(
    die ? [...die.options] : Array(6).fill("")
  );
  const [colorHex, setColorHex] = useState(
    die?.colorHex ?? generateRandomHex()
  );
  const [pattern, setPattern] = useState<DiePattern>(die?.pattern ?? "solid");
  const [errors, setErrors] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Prevent background (document body) scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    // Compute scrollbar width to avoid layout shift when hiding scroll
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      // Add padding so content does not shift due to scrollbar disappearance
      document.body.style.paddingRight = String(scrollBarWidth) + "px";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);
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

  function clearOptions() {
    setOptions((prev) =>
      prev.some((o) => o.trim()) ? prev.map(() => "") : prev
    );
  }

  /** Fetch related words from a free public lexical API (Datamuse) to auto-populate option text. */
  async function autoFillOptions(): Promise<void> {
    if (!name.trim()) return;
    setGenerating(true);
    setGenerationError(null);
    setGenerationNotice(null);
    try {
      const q = encodeURIComponent(name.trim());
      // Request more than needed so we can filter.
      const resp = await fetch(
        "https://api.datamuse.com/words?rel_trg=" +
          q +
          "&max=" +
          String(sides * 3)
      );
      if (!resp.ok) throw new Error("request failed: " + String(resp.status));
      const json: unknown = await resp.json();
      const data = Array.isArray(json)
        ? (json as { word?: unknown; score?: unknown }[])
        : [];
      const picked: string[] = [];
      for (const entry of data) {
        if (typeof entry.word !== "string") continue;
        const w = entry.word.trim();
        // basic filters: avoid phrases, very short tokens, duplicates
        if (w.includes(" ") || w.length < 3) continue;
        const formatted = w
          .replace(/[_-]/g, " ")
          .replace(/^./, (c) => c.toUpperCase());
        if (!picked.includes(formatted)) picked.push(formatted);
        if (picked.length >= sides) break;
      }
      while (picked.length < sides) {
        picked.push(name.trim() + " " + String(picked.length + 1));
      }
      // Overwrite only blank slots; if user already typed values keep them.
      setOptions((prev) =>
        prev.map((o, i) => (o.trim() ? o : (picked[i] ?? o)))
      );
      setGenerationNotice(
        "Auto-filled " + String(Math.min(picked.length, sides)) + " option(s)."
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to generate options.";
      setGenerationError(msg);
    } finally {
      setGenerating(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const filteredNames = editMode
      ? existingNames.filter(
          (n) => n.toLowerCase() !== originalName.toLowerCase()
        )
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
    <div className={styles.overlay}>
      <form onSubmit={handleSave} className={styles.form}>
        {/* Fixed header */}
        <div className={styles.header}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                backgroundImage:
                  "linear-gradient(90deg,#7b5df9 0%, #c184ff 50%, #8bd6ff 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {editMode ? "Edit Die" : "Create Die"}
            </h2>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Die editor sections"
            >
              {[
                { key: "basic", label: "Basics" },
                { key: "appearance", label: "Appearance" },
              ].map((tab) => {
                const selected = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`dice-tabpanel-${tab.key}`}
                    id={`dice-tab-${tab.key}`}
                    onClick={() => {
                      setActiveTab(tab.key as typeof activeTab);
                    }}
                    className={classNames(styles.tab, {
                      [styles["tab-active"]]: selected,
                    })}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: "0.5rem",
            }}
          >
            <DieThumbnail die={previewDie} showOption={null} size={90} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          {activeTab === "basic" && (
            <div
              id="dice-tabpanel-basic"
              role="tabpanel"
              aria-labelledby="dice-tab-basic"
            >
              <label className={styles["label-block"]}>
                <span className={styles["label-title"]}>Name</span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={styles["name-input"]}
                />
              </label>
              <fieldset
                className={classNames(
                  styles.fieldset,
                  styles["divider-section"]
                )}
              >
                <legend className={styles["sides-legend"]}>Sides</legend>
                <div className={styles["preset-wrap"]}>
                  {DIE_SIDE_PRESETS.map((preset) => {
                    const selected = sides === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          updateSides(preset);
                        }}
                        className={classNames(styles["preset-button"], {
                          [styles["preset-button-active"]]: selected,
                        })}
                      >
                        d{preset}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className={styles["option-list"]}>
                {options.map((opt, i) => (
                  <label key={i} className={styles["option-row"]}>
                    <span className={styles["option-index"]}>{i + 1}</span>
                    <input
                      value={opt}
                      placeholder={`Option ${(i + 1).toString()}`}
                      onChange={(e) => {
                        updateOption(i, e.target.value);
                      }}
                      className={styles["input-text"]}
                    />
                  </label>
                ))}
              </div>
              <div className={styles["actions-row"]} aria-live="polite">
                <button
                  type="button"
                  disabled={!name.trim() || generating}
                  onClick={() => {
                    void autoFillOptions();
                  }}
                  className={styles["preset-button"]}
                  aria-disabled={!name.trim() || generating}
                  aria-busy={generating || undefined}
                >
                  {generating ? "Generating..." : "Auto-Fill Options"}
                </button>
                <button
                  type="button"
                  disabled={options.every((o) => !o.trim())}
                  onClick={() => {
                    clearOptions();
                  }}
                  className={styles["preset-button"]}
                  aria-disabled={options.every((o) => !o.trim())}
                >
                  Clear Options
                </button>
                {!name.trim() && (
                  <span className={styles["small-note"]}>
                    Enter a name first to enable auto-fill.
                  </span>
                )}
                {generationError && (
                  <span className={styles["small-note-error"]}>
                    {generationError}
                  </span>
                )}
                {generationNotice && (
                  <span className={styles["small-note-success"]}>
                    {generationNotice}
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div
              id="dice-tabpanel-appearance"
              role="tabpanel"
              aria-labelledby="dice-tab-appearance"
            >
              <div className={styles["divider-section"]}>
                <label className={styles["label-block"]}>
                  <span className={styles["label-title"]}>Base Color</span>
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => {
                      const v = e.target.value;
                      setColorHex(v);
                      setAppearance((prev) => ({
                        ...prev,
                        attenuationColor: v,
                        sheenColor: v,
                      }));
                    }}
                    className={styles["input-text"]}
                  />
                </label>
                <fieldset
                  className={classNames(
                    styles.fieldset,
                    styles["divider-section"]
                  )}
                >
                  <legend className={styles.legend}>Presets</legend>
                  <div className={styles["preset-wrap"]}>
                    {APPEARANCE_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        className={styles["preset-button"]}
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
                <fieldset
                  className={classNames(
                    styles.fieldset,
                    styles["divider-section"]
                  )}
                >
                  <legend className={styles.legend}>Pattern</legend>
                  <div className={styles["radio-row"]}>
                    {DIE_PATTERNS.map((p) => (
                      <label key={p} className={styles["radio-item"]}>
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
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Material</legend>
                  <div className={styles["grid-controls"]}>
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
                      <label key={key} className={styles["range-label"]}>
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
                            setAppearance((prev) => ({
                              ...prev,
                              [key]: value,
                            }));
                          }}
                        />
                      </label>
                    ))}
                    <label className={styles["range-label"]}>
                      attenuationColor
                      <input
                        type="color"
                        value={appearance?.attenuationColor ?? colorHex}
                        onChange={(e) => {
                          setAppearance((prev) => ({
                            ...prev,
                            attenuationColor: e.target.value,
                          }));
                        }}
                      />
                    </label>
                    <label className={styles["range-label"]}>
                      sheenColor
                      <input
                        type="color"
                        value={appearance?.sheenColor ?? colorHex}
                        onChange={(e) => {
                          setAppearance((prev) => ({
                            ...prev,
                            sheenColor: e.target.value,
                          }));
                        }}
                      />
                    </label>
                    <label className={styles["range-label"]}>
                      sparkleColor
                      <input
                        type="color"
                        value={appearance?.sparkleColor ?? "#ffffff"}
                        onChange={(e) => {
                          setAppearance((prev) => ({
                            ...prev,
                            sparkleColor: e.target.value,
                          }));
                        }}
                      />
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          )}
        </div>
        {/* Floating error toasts */}
        {errors.length > 0 && (
          <div
            className={styles["toast-layer"]}
            role="alert"
            aria-live="assertive"
          >
            {errors.map((error, index) => (
              <div key={index} className={styles.toast}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(120deg, rgba(255,70,70,0.20), rgba(255,255,255,0) 65%)",
                  }}
                />
                <span style={{ position: "relative", flex: 1 }}>{error}</span>
                <button
                  type="button"
                  aria-label="Dismiss error"
                  onClick={() => {
                    setErrors((prev) => prev.filter((_, j) => j !== index));
                  }}
                  className={styles["toast-dismiss"]}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Fixed footer */}
        <div className={styles.footer}>
          <button type="submit" className={styles["save-button"]}>
            {editMode ? "Update Die" : "Save Die"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={styles["cancel-button"]}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
