import React from "react";
import { v4 as uuid } from "uuid";
import { css } from "../styled-system/css";
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

  // Precomputed classes / strings (avoid dynamic style object values)
  const songButtonBaseClass = css({
    textAlign: "left",
    w: "full",
    px: 2,
    py: 1,
    rounded: "sm",
    mb: 1,
    cursor: "pointer",
  });
  const songButtonSelectedClass = css({ bg: "green.600", color: "white" });
  const songButtonUnselectedClass = css({ bg: "gray.200", color: "black" });
  const selectionAreaClass = css({
    minH: 40,
    border: "1px dashed",
    rounded: "md",
    p: 4,
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "flex-start",
    position: "relative",
  });
  const songStatusMessage = currentSong
    ? "Adding rolls auto-saves to current song."
    : "Enter a song name and press Create (or Enter) to start auto-saving rolls.";

  return (
    <div
      className={`${css({ maxW: "1600px", mx: "auto", p: 4, pb: 24 })} ${fontTheme === "classic" ? "r2w-classic" : "r2w-alt"}`}
    >
      <header className={css({ mb: 6, position: "relative" })}>
        <div className={css({ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" })}>
          <h1
            className={css({ fontSize: "4xl", fontWeight: "bold", backgroundClip: "text", color: "transparent" })}
            style={{ backgroundImage: "var(--r2w-header-gradient)", WebkitBackgroundClip: "text" }}
          >
            Roll2Write
          </h1>
          <div className={css({ position: "relative", display: "flex", gap: 3 })}>
            <Button
              variant="primary"
              onClick={() => {
                setSongsOpen((o) => !o);
              }}
            >
              Songs {songsOpen ? "▲" : "▼"}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowPast((o) => !o);
              }}
            >
              {showPast ? "Hide Past" : "Past Rolls"}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowFonts(true);
              }}
            >
              Fonts
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setFontTheme((t) => (t === "classic" ? "alt" : "classic"));
              }}
            >
              Theme: {fontTheme === "classic" ? "Classic" : "Alt"}
            </Button>
          </div>
          <div className={css({ flex: 1 })} />
        </div>
        {songsOpen && (
          <div
            className={css({
              position: "absolute",
              top: "100%",
              left: 0,
              mt: 2,
              rounded: "md",
              zIndex: 10,
              minW: 60,
              maxH: 80,
              overflowY: "auto",
              p: 2,
            })}
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(18px)",
              color: "#ebe5d7",
            }}
          >
            {songs.length === 0 && <p className={css({ m: 0, fontSize: "sm" })}>No songs yet.</p>}
            <ul className={css({ listStyle: "none", m: 0, p: 0 })}>
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
        <p className={css({ mt: 4 })}>{songStatusMessage}</p>
      </header>

      {/* Main Interaction Section */}
      <section
        className={css({ rounded: "md", p: 5, mb: 12, position: "relative" })}
        style={{
          border: "1px solid var(--r2w-panel-border)",
          background: "var(--r2w-panel-bg)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className={css({ display: "flex", flexDirection: { base: "column", lg: "row" }, gap: 8 })}>
          {/* Left: Selection + Rolls */}
          <div className={css({ flex: 1, minW: 0 })}>
            <div className={css({ mb: 4 })}>
              {!currentSong && (
                <div className={css({ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "stretch" })}>
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
                    className={css({ px: 3, py: 2, flex: 1, minW: 60 })}
                    style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }}
                  />
                  <Button
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
                <h2 className={css({ fontSize: "2xl", fontWeight: "bold", m: 0 })}>{currentSong.name}</h2>
              )}
            </div>
            <h3 className={css({ mt: 0, mb: 2, fontSize: "lg", fontWeight: "semibold" })}>Selected Dice</h3>
            <div
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                const dieId = e.dataTransfer.getData("text/plain");
                if (dieId) addDieToSelection(dieId);
              }}
              className={selectionAreaClass}
              style={{ borderColor: "var(--r2w-panel-border)", background: "var(--r2w-selection-bg)" }}
            >
              {selectedDice.length === 0 && (
                <span className={css({ fontSize: "sm", color: "gray.300" })}>
                  Drag dice here or click dice to build a set.
                </span>
              )}
              {selectedDice.map((sel) => {
                const die = diceById[sel.dieId];
                return (
                  <div key={sel.id} className={css({ position: "relative" })}>
                    <DieThumbnail die={die} size={72} />
                    <button
                      type="button"
                      onClick={() => {
                        removeSelection(sel.id);
                      }}
                      className={css({
                        position: "absolute",
                        top: 0,
                        right: 0,
                        w: 5,
                        h: 5,
                        rounded: "full",
                        fontSize: "xs",
                        lineHeight: 1,
                        cursor: "pointer",
                        color: "white",
                      })}
                      style={{ background: "#f87171" }}
                      aria-label="Remove selected die"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div className={css({ mt: 4, display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" })}>
              <Button
                variant="primary"
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
                <span className={css({ fontSize: "sm", color: "gray.300" })}>Enter a song name first.</span>
              )}
            </div>
            <h3 className={css({ mt: 8, mb: 2, fontSize: "lg", fontWeight: "semibold" })}>Current Song Rolls</h3>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: 4 })}>
              {currentSong?.rollIds.map((id, index) => {
                const roll = rollsById[id];
                const die = diceById[roll.dieId];
                return (
                  <div key={id} className={css({ position: "relative" })}>
                    <div
                      className={css({ rounded: "sm", px: 3, py: 2, color: "white", fontSize: "sm" })}
                      style={{ border: "1px solid rgba(255,255,255,0.2)", background: "#4a2ed6" }}
                    >
                      {die.name}: {roll.option}
                    </div>
                    <button
                      onClick={() => {
                        removeRollFromCurrent(index);
                      }}
                      className={css({
                        position: "absolute",
                        top: 0,
                        right: 0,
                        w: 5,
                        h: 5,
                        rounded: "full",
                        color: "white",
                        fontSize: "xs",
                        lineHeight: 1,
                        cursor: "pointer",
                      })}
                      style={{ background: "#f5b833" }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {!currentSong && <p className={css({ fontSize: "sm" })}>(Enter a song name above.)</p>}
            </div>
          </div>
          {/* Right: Dice Library */}
          <div className={css({ flex: 1 })}>
            <h3 className={css({ mt: 0, mb: 2, fontSize: "lg", fontWeight: "semibold" })}>Dice Library</h3>
            <div
              className={css({
                display: "grid",
                gap: 4,
                gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))",
                alignItems: "flex-start",
              })}
            >
              {dice.map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", d.id);
                  }}
                  className={css({ position: "relative" })}
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
                    className={css({
                      position: "absolute",
                      top: 1,
                      right: 1,
                      fontSize: "xs",
                      px: 1,
                      py: 0.5,
                      rounded: "sm",
                      cursor: "pointer",
                    })}
                    style={{
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

      {/* Floating create die button */}
      <button
        onClick={() => {
          setEditingDie(null);
          setShowCreateDie(true);
        }}
        className={css({
          position: "fixed",
          bottom: 6,
          right: 6,
          rounded: "full",
          p: 4,
          fontSize: "2xl",
          cursor: "pointer",
          boxShadow: "0 6px 22px -6px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)",
          zIndex: 60,
        })}
        style={{
          background: "var(--r2w-button-primary-bg)",
          color: "white",
          border: "1px solid var(--r2w-button-primary-border)",
        }}
        aria-label="Create Die"
        title="Create Die"
      >
        + 🎲
      </button>

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
    </div>
  );
}

export default App;
