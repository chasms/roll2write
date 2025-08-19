import React from "react";
import { v4 as uuid } from "uuid";
import { css, cva } from "../styled-system/css";
// Legacy components (retained but unused in new tabletop flow)
// import { DiceForm } from "./components/DiceForm";
// import { DiceList } from "./components/DiceList";
// import { Roller } from "./components/Roller";
// import { RollHistory } from "./components/RollHistory";
// import { SongList } from "./components/SongList";
import { Button } from "./components/Button";
import { CreateDieModal } from "./components/CreateDieModal";
import { DiceDrawer } from "./components/DiceDrawer";
import { PastRollsDrawer } from "./components/PastRollsDrawer";
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
  const [editingDie, setEditingDie] = React.useState<
    import("./domain/types").DieDefinition | null
  >(null);
  const diceById = React.useMemo(
    () => Object.fromEntries(dice.map((d) => [d.id, d])),
    [dice],
  );
  const rollsById = React.useMemo(
    () => Object.fromEntries(rolls.map((r) => [r.id, r])),
    [rolls],
  );

  React.useEffect(() => {
    if (!currentSongId && newSongName.trim()) {
      const song: Song = {
        id: uuid(),
        name: newSongName.trim(),
        rollIds: [],
        createdAt: new Date().toISOString(),
      };
      addSong(song);
      setCurrentSongId(song.id);
      setSongsOpen(false);
    }
  }, [newSongName, currentSongId, addSong]);

  const currentSong = React.useMemo(
    () => songs.find((s) => s.id === currentSongId) ?? null,
    [songs, currentSongId],
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

  const songListItemButtonClass = cva({
    base: {
      textAlign: "left",
      w: "full",
      px: 2,
      py: 1,
      rounded: "sm",
      mb: 1,
    },
    variants: {
      selected: {
        true: { bg: "green.600", color: "white" },
        false: { bg: "gray.200", color: "black" },
      },
    },
  });

  return (
    <div className={css({ maxW: "1400px", mx: "auto", p: 4, pb: 64 })}>
      <header className={css({ mb: 4, position: "relative" })}>
        <div className={css({ display: "flex", alignItems: "center", gap: 4 })}>
          <h1 className={css({ fontSize: "3xl", fontWeight: "bold" })}>
            Roll2Write
          </h1>
          <div className={css({ position: "relative" })}>
            <Button
              variant="primary"
              onClick={() => {
                setSongsOpen((o) => !o);
              }}
            >
              Songs {songsOpen ? "▲" : "▼"}
            </Button>
            {songsOpen && (
              <div
                className={css({
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  mt: 2,
                  border: "1px solid",
                  bg: { base: "white", _dark: "gray.800" },
                  color: { base: "black", _dark: "white" },
                  rounded: "sm",
                  zIndex: 10,
                  minW: 60,
                  maxH: 80,
                  overflowY: "auto",
                  p: 2,
                })}
              >
                {songs.length === 0 && (
                  <p className={css({ m: 0, fontSize: "sm" })}>No songs yet.</p>
                )}
                <ul className={css({ listStyle: "none", m: 0, p: 0 })}>
                  {songs.map((s) => (
                    <li key={s.id}>
                      <button
                        className={songListItemButtonClass({
                          selected: s.id === currentSongId,
                        })}
                        onClick={() => {
                          setCurrentSongId(s.id);
                          setSongsOpen(false);
                        }}
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className={css({ mt: 2 })}>
          {currentSong
            ? "Adding rolls auto-saves to current song."
            : "Enter a song name to create and start auto-saving."}
        </p>
      </header>
      <section
        className={css({
          border: "1px solid",
          rounded: "md",
          minH: 96,
          p: 4,
          mb: 8,
          position: "relative",
          bg: { base: "gray.50", _dark: "gray.900" },
        })}
      >
        <div className={css({ mb: 4 })}>
          {!currentSong && (
            <input
              placeholder="New song name..."
              value={newSongName}
              onChange={(e) => {
                setNewSongName(e.target.value);
              }}
              className={css({ border: "1px solid", px: 3, py: 2, w: "full" })}
            />
          )}
          {currentSong && (
            <h2 className={css({ fontSize: "2xl", fontWeight: "bold", m: 0 })}>
              {currentSong.name}
            </h2>
          )}
        </div>
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            alignItems: "flex-start",
          })}
        >
          {currentSong?.rollIds.map((id, index) => {
            const roll = rollsById[id];
            const die = diceById[roll.dieId];
            return (
              <div key={id} className={css({ position: "relative" })}>
                <div
                  className={css({
                    border: "1px solid",
                    rounded: "sm",
                    px: 2,
                    py: 1,
                    bg: "purple.600",
                    color: "white",
                    fontSize: "sm",
                  })}
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
                    bg: "red.600",
                    color: "white",
                    fontSize: "xs",
                    lineHeight: 1,
                  })}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            );
          })}
          {!currentSong && (
            <p>(Enter a song name above then roll dice or pick past rolls.)</p>
          )}
        </div>
      </section>
      <div
        className={css({
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          display: "flex",
          flexDirection: { base: "column", md: "row" },
          gap: { base: 2, md: 0 },
          zIndex: 20,
        })}
      >
        <div className={css({ flex: 1 })}>
          <DiceDrawer
            dice={dice}
            onRoll={handleNewRoll}
            onOpenCreate={() => {
              setEditingDie(null);
              setShowCreateDie(true);
            }}
            onOpenEdit={(die) => {
              setEditingDie(die);
              setShowCreateDie(true);
            }}
          />
        </div>
        <div className={css({ flex: 1 })}>
          <PastRollsDrawer
            rolls={rolls}
            diceById={diceById}
            onSelectRoll={handlePastRollSelect}
          />
        </div>
      </div>
      {showCreateDie && (
        <CreateDieModal
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
    </div>
  );
}

export default App;
