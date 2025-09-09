import React from "react";
import { v4 as uuid } from "uuid";
// Styling migrated fully to SCSS Modules.
import styles from "./AppLayout.module.scss";
import { Button } from "./components/Button";
import { DiceFormModal } from "./components/DiceFormModal";
import { DieThumbnail } from "./components/DieThumbnail";
import { FontGallery } from "./components/FontGallery";
import { PastRollsSidebar } from "./components/PastRollsSidebar";
import { DEFAULT_DICE } from "./domain/defaultDice";
import type { RollResult, Song } from "./domain/types";
import { useDice } from "./hooks/useDice";
import { useRolls } from "./hooks/useRolls";
import { useSongs } from "./hooks/useSongs";

function App() {
  const { dice, addDie, updateDie } = useDice();
  const { rolls, addRoll } = useRolls();
  const { songs, addSong, updateSong } = useSongs();
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [newSongName, setNewSongName] = React.useState("");
  const [songsOpen, setSongsOpen] = React.useState(false);
  const [showCreateDie, setShowCreateDie] = React.useState(false);
  const [editingDie, setEditingDie] = React.useState<import("./domain/types").DieDefinition | null>(null);
  const [showPast, setShowPast] = React.useState(false);
  const [showFonts, setShowFonts] = React.useState(false);
  const [fontTheme, setFontTheme] = React.useState<"classic" | "alt">("alt");
  const [selectedDice, setSelectedDice] = React.useState<{ id: string; dieId: string }[]>([]);
  const seededRef = React.useRef(false);

  const diceById = React.useMemo(() => Object.fromEntries(dice.map((d) => [d.id, d])), [dice]);
  const rollsById = React.useMemo(() => Object.fromEntries(rolls.map((r) => [r.id, r])), [rolls]);

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

  const currentSong = React.useMemo(() => songs.find((s) => s.id === currentSongId) ?? null, [songs, currentSongId]);

  function appendRollToCurrentSong(rollId: string) {
    if (!currentSong) return;
    updateSong(currentSong.id, (prev) => ({ ...prev, rollIds: [...prev.rollIds, rollId] }));
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
    updateSong(currentSong.id, (prev) => ({ ...prev, rollIds: prev.rollIds.filter((_, i) => i !== index) }));
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
  const songButtonBaseClass = styles.songBtn;
  const songButtonSelectedClass = styles.songBtnSelected;
  const songButtonUnselectedClass = styles.songBtnUnselected;
  const selectionAreaClass = styles.selectionArea;
  const songStatusMessage = currentSong
    ? "Adding rolls auto-saves to current song."
    : "Enter a song name and press Create (or Enter) to start auto-saving rolls.";

  const dieModalOpen = showCreateDie; // derived for clarity

  return (
    <div className={`${styles.root} ${fontTheme === "classic" ? "r2w-classic" : "r2w-alt"}`}>
      <header className={styles.header}>
        <div className={styles.flexRow}>
          <h1 className={styles.title}>Roll2Write</h1>
          <div style={{ position: "relative", display: "flex", gap: "0.75rem" }}>
            <Button
              className="r2w-fae-btn"
              variant="fae"
              onClick={() => {
                setSongsOpen((o) => !o);
              }}
            >
              Songs {songsOpen ? "▲" : "▼"}
            </Button>
            <Button
              className="r2w-fae-btn"
              variant="fae"
              onClick={() => {
                setShowPast((o) => !o);
              }}
            >
              {showPast ? "Hide Past" : "Past Rolls"}
            </Button>
            <Button
              className="r2w-fae-btn"
              variant="fae"
              onClick={() => {
                setShowFonts(true);
              }}
            >
              Fonts
            </Button>
            <Button
              className="r2w-fae-btn"
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
          <div className={styles.songsPanel}>
            {songs.length === 0 && <p style={{ margin: 0, fontSize: "0.875rem" }}>No songs yet.</p>}
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
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
      <section className={styles.mainSection}>
        <div className={styles.interactionRow}>
          {/* Left: Selection + Rolls */}
          <div className={styles.leftCol}>
            <div style={{ marginBottom: "1rem" }}>
              {!currentSong && (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch" }}>
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
                    className="r2w-fae-btn"
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
              {currentSong && <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{currentSong.name}</h2>}
            </div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
              Selected Dice
            </h3>
            <div
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                const dieId = e.dataTransfer.getData("text/plain");
                if (dieId) addDieToSelection(dieId);
              }}
              className={selectionAreaClass}
            >
              {selectedDice.length === 0 && (
                <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                  Drag dice here or click dice to build a set.
                </span>
              )}
              {selectedDice.map((sel) => {
                const die = diceById[sel.dieId];
                return (
                  <div key={sel.id} style={{ position: "relative" }}>
                    <DieThumbnail die={die} size={72} />
                    <button
                      type="button"
                      onClick={() => {
                        removeSelection(sel.id);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        lineHeight: 1,
                        cursor: "pointer",
                        color: "white",
                        background: "#f87171",
                      }}
                      aria-label="Remove selected die"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <Button
                className="r2w-fae-btn"
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
              {!currentSong && <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>Enter a song name first.</span>}
            </div>
            <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
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
              {!currentSong && <p style={{ fontSize: "0.875rem" }}>(Enter a song name above.)</p>}
            </div>
          </div>
          {/* Right: Dice Library */}
          <div className={styles.rightCol}>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.125rem", fontWeight: 600 }}>
              Dice Library
            </h3>
            <div className={styles.diceLibraryGrid}>
              {dice.map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", d.id);
                  }}
                  style={{ position: "relative" }}
                >
                  <DieThumbnail
                    die={d}
                    size={96}
                    onClick={() => {
                      addDieToSelection(d.id);
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      top: "0.25rem",
                      right: "0.25rem",
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.4rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      background: "rgba(0,0,0,0.45)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDie(d);
                      setShowCreateDie(true);
                    }}
                    aria-label="Edit die"
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
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
          existingNames={dice.filter((d) => d.id !== editingDie?.id).map((d) => d.name)}
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
      <div className="r2w-sparkles" />
    </div>
  );
}

export default App;
