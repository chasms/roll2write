import { classNamesFunc } from "classnames-generics";
import React from "react";
import { v4 as uuid } from "uuid";
import styles from "./App.module.scss";
import githubIcon from "./assets/github.png";
import { Button } from "./components/Button";
import { DiceFormModal } from "./components/DiceFormModal";
import { DiceStage } from "./components/DiceStage";
import { FontGallery } from "./components/FontGallery";
import { PastRollsSidebar } from "./components/PastRollsSidebar";
import { DEFAULT_DICE } from "./domain/defaultDice";
import type { RollResult, Song } from "./domain/types";
import { useDice } from "./hooks/useDice";
import { useRolls } from "./hooks/useRolls";
import { useSongs } from "./hooks/useSongs";

const classNames = classNamesFunc<keyof typeof styles>();

function App() {
  const { dice, addDie, updateDie } = useDice();
  const { rolls, addRoll } = useRolls();
  const { songs, addSong, updateSong } = useSongs();
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [newSongName, setNewSongName] = React.useState("");
  const [songsOpen, setSongsOpen] = React.useState(false);
  const [showCreateDie, setShowCreateDie] = React.useState(false);
  const [editingDie, setEditingDie] = React.useState<
    import("./domain/types").DieDefinition | null
  >(null);
  const [showPast, setShowPast] = React.useState(false);
  const [showFonts, setShowFonts] = React.useState(false);
  const [fontTheme, setFontTheme] = React.useState<"classic" | "alt">("alt");
  const [selectedDice, setSelectedDice] = React.useState<
    { id: string; dieId: string }[]
  >([]);
  const [rollPulse, setRollPulse] = React.useState(0);
  const seededRef = React.useRef(false);

  const diceById = React.useMemo(
    () => Object.fromEntries(dice.map((d) => [d.id, d])),
    [dice]
  );
  const rollsById = React.useMemo(
    () => Object.fromEntries(rolls.map((r) => [r.id, r])),
    [rolls]
  );

  function createSong() {
    if (currentSongId) return; // already have one
    const name = newSongName.trim();
    if (!name) return;
    const song: Song = {
      id: uuid(),
      name,
      rollIds: [],
      createdAt: new Date().toISOString(),
    };
    addSong(song);
    setCurrentSongId(song.id);
    setSongsOpen(false);
    setNewSongName("");
  }

  // Seed default dice once.
  React.useEffect(() => {
    if (seededRef.current) return;
    const existingIds = new Set(dice.map((d) => d.id));
    const missing = DEFAULT_DICE.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      missing.forEach((d) => {
        addDie(d);
      });
    }
    seededRef.current = true;
  }, [dice, addDie]);

  const currentSong = React.useMemo(
    () => songs.find((s) => s.id === currentSongId) ?? null,
    [songs, currentSongId]
  );

  function appendRollToCurrentSong(rollId: string) {
    if (!currentSong) return;
    updateSong(currentSong.id, (prev) => ({
      ...prev,
      rollIds: [...prev.rollIds, rollId],
    }));
  }

  function handleNewRoll(roll: RollResult) {
    addRoll(roll);
    appendRollToCurrentSong(roll.id);
  }

  function handlePastRollSelect(r: RollResult) {
    appendRollToCurrentSong(r.id);
  }

  function removeRollFromCurrent(index: number) {
    if (!currentSong) return;
    updateSong(currentSong.id, (prev) => ({
      ...prev,
      rollIds: prev.rollIds.filter((_, i) => i !== index),
    }));
  }

  function addDieToSelection(dieId: string) {
    setSelectedDice((cur) => [...cur, { id: uuid(), dieId }]);
  }

  function removeSelection(id: string) {
    setSelectedDice((cur) => cur.filter((s) => s.id !== id));
  }

  function clearSelection() {
    setSelectedDice([]);
  }

  function rollAllSelected() {
    if (!currentSong || selectedDice.length === 0) return;
    setRollPulse((v) => v + 1);
    selectedDice.forEach((sel) => {
      const die = diceById[sel.dieId];
      const sideIndex = Math.floor(Math.random() * die.sides);
      const roll: RollResult = {
        id: uuid(),
        dieId: die.id,
        sideIndex,
        option: die.options[sideIndex],
        timestamp: new Date().toISOString(),
      };
      handleNewRoll(roll);
    });
  }

  // Class mappings now provided by SCSS module
  const songButtonBaseClass = styles["song-button"];
  const songButtonSelectedClass = styles["song-button-selected"];
  const songButtonUnselectedClass = styles["song-button-unselected"];
  const selectionAreaClass = styles["selection-area"];
  const songStatusMessage = currentSong
    ? "Adding rolls auto-saves to current song."
    : "Enter a song name and press Create (or Enter) to start auto-saving rolls.";

  const dieModalOpen = showCreateDie; // derived for clarity

  return (
    <div
      className={classNames(
        styles.root,
        fontTheme === "classic" ? styles["r2w-classic"] : styles["r2w-alt"]
      )}
    >
      <header className={styles.header}>
        <div className={styles["flex-row"]}>
          <h1 className={styles.title}>Roll2Write</h1>
          <div
            style={{ position: "relative", display: "flex", gap: "0.75rem" }}
          >
            <Button
              className={styles["r2w-fae-btn"]}
              variant="fae"
              onClick={() => {
                setSongsOpen((o) => !o);
              }}
            >
              Songs {songsOpen ? "▲" : "▼"}
            </Button>
            <Button
              className={styles["r2w-fae-btn"]}
              variant="fae"
              onClick={() => {
                setShowPast((o) => !o);
              }}
            >
              {showPast ? "Hide Past" : "Past Rolls"}
            </Button>
            <Button
              className={styles["r2w-fae-btn"]}
              variant="fae"
              onClick={() => {
                setShowFonts(true);
              }}
            >
              Fonts
            </Button>
            <Button
              className={styles["r2w-fae-btn"]}
              variant="fae"
              onClick={() => {
                setFontTheme((t) => (t === "classic" ? "alt" : "classic"));
              }}
            >
              Theme: {fontTheme === "classic" ? "Classic" : "Alt"}
            </Button>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        {songsOpen && (
          <div className={styles["songs-panel"]}>
            {songs.length === 0 && (
              <p style={{ margin: 0, fontSize: "0.875rem" }}>No songs yet.</p>
            )}
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li key="__new">
                <button
                  className={`${songButtonBaseClass} ${!currentSongId ? songButtonSelectedClass : songButtonUnselectedClass}`}
                  onClick={() => {
                    setCurrentSongId(null);
                    setSongsOpen(false);
                    setNewSongName("");
                  }}
                >
                  + New Song
                </button>
              </li>
              {songs.map((s) => {
                const selected = s.id === currentSongId;
                return (
                  <li key={s.id}>
                    <button
                      className={`${songButtonBaseClass} ${selected ? songButtonSelectedClass : songButtonUnselectedClass}`}
                      onClick={() => {
                        setCurrentSongId(s.id);
                        setSongsOpen(false);
                      }}
                    >
                      {s.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <p style={{ marginTop: "1rem" }}>{songStatusMessage}</p>
      </header>

      {/* Main Interaction Section */}
      <section className={styles["main-section"]}>
        <div className={styles["interaction-row"]}>
          {/* Left: Selection + Rolls */}
          <div className={styles["left-col"]}>
            <div style={{ marginBottom: "1rem" }}>
              {!currentSong && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "stretch",
                  }}
                >
                  <input
                    placeholder="New song name..."
                    value={newSongName}
                    onChange={(e) => {
                      setNewSongName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        createSong();
                      }
                    }}
                    style={{
                      padding: "0.5rem 0.75rem",
                      flex: 1,
                      minWidth: "15rem",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <Button
                    className={styles["r2w-fae-btn"]}
                    variant="primary"
                    disabled={!newSongName.trim()}
                    onClick={() => {
                      createSong();
                    }}
                  >
                    Create
                  </Button>
                </div>
              )}
              {currentSong && (
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                  {currentSong.name}
                </h2>
              )}
            </div>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
              }}
            >
              Selected Dice
            </h3>
            <div className={selectionAreaClass}>
              <DiceStage
                mode="selected"
                selected={selectedDice.map((s) => ({
                  id: s.id,
                  die: diceById[s.dieId],
                }))}
                library={[]}
                onRemoveSelected={(selectionId) => {
                  removeSelection(selectionId);
                }}
                maxHeight={200}
                rowPx={110}
                cameraZ={10}
                cameraFov={36}
                rollPulse={rollPulse}
              />
              {selectedDice.length === 0 && (
                <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                  Click dice in the Library canvas to add them here, then click
                  a die in this canvas to remove it. Drag to rotate dice.
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Button
                className={styles["r2w-fae-btn"]}
                variant="fae"
                disabled={!currentSong || selectedDice.length === 0}
                onClick={() => {
                  rollAllSelected();
                }}
              >
                Roll All ({selectedDice.length})
              </Button>
              <Button
                variant="secondary"
                disabled={selectedDice.length === 0}
                onClick={() => {
                  clearSelection();
                }}
              >
                Clear Set
              </Button>
              {!currentSong && (
                <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                  Enter a song name first.
                </span>
              )}
            </div>
            <h3
              style={{
                marginTop: "2rem",
                marginBottom: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
              }}
            >
              Current Song Rolls
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {currentSong?.rollIds.map((id, index) => {
                const roll = rollsById[id];
                const die = diceById[roll.dieId];
                return (
                  <div key={id} style={{ position: "relative" }}>
                    <div
                      style={{
                        borderRadius: "4px",
                        padding: "0.5rem 0.75rem",
                        color: "white",
                        fontSize: "0.875rem",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "#4a2ed6",
                      }}
                    >
                      {die.name}: {roll.option}
                    </div>
                    <button
                      onClick={() => {
                        removeRollFromCurrent(index);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "999px",
                        color: "white",
                        fontSize: "0.75rem",
                        lineHeight: 1,
                        cursor: "pointer",
                        background: "#f5b833",
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {!currentSong && (
                <p style={{ fontSize: "0.875rem" }}>
                  (Enter a song name above.)
                </p>
              )}
            </div>
          </div>
          {/* Right: Dice Library */}
          <div className={styles["right-col"]}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
              }}
            >
              Dice Library
            </h3>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#d1d5db",
                marginBottom: "0.5rem",
              }}
            >
              Click a die to add it to the Selected canvas. Drag to rotate.
            </div>
            <DiceStage
              mode="library"
              selected={[]}
              library={dice}
              onAddFromLibrary={(dieId) => {
                addDieToSelection(dieId);
              }}
              maxHeight={260} // slightly taller library canvas
              rowPx={110}
              cameraZ={10}
              cameraFov={36}
            />
          </div>
        </div>
      </section>

      {/* Floating create die button (hidden while modal open) */}
      {!dieModalOpen && (
        <button
          onClick={() => {
            setEditingDie(null);
            setShowCreateDie(true);
          }}
          className={styles.fab}
          aria-label="Create Die"
          title="Create Die"
        >
          + 🎲
        </button>
      )}

      <PastRollsSidebar
        open={showPast}
        onClose={() => {
          setShowPast(false);
        }}
        rolls={rolls}
        diceById={diceById}
        onSelectRoll={handlePastRollSelect}
      />

      {showCreateDie && (
        <DiceFormModal
          die={editingDie ?? undefined}
          existingNames={dice
            .filter((d) => d.id !== editingDie?.id)
            .map((d) => d.name)}
          onClose={() => {
            setShowCreateDie(false);
            setEditingDie(null);
          }}
          onCreated={addDie}
          onUpdated={(d) => {
            updateDie(d.id, () => d);
          }}
        />
      )}
      {showFonts && (
        <FontGallery
          onClose={() => {
            setShowFonts(false);
          }}
        />
      )}
      <a
        className={styles["github-button"]}
        href="https://github.com/chasms/roll2write"
        target="_blank"
        rel="noreferrer"
      >
        <img className={styles["github-image"]} src={githubIcon} />
      </a>
      <div className="r2w-sparkles" />
    </div>
  );
}

export default App;
