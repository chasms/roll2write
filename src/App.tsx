import React from "react";
import { css } from "../styled-system/css";
import { DiceForm } from "./components/DiceForm";
import { DiceList } from "./components/DiceList";
import { Roller } from "./components/Roller";
import { RollHistory } from "./components/RollHistory";
import { SongList } from "./components/SongList";
import { useDice } from "./hooks/useDice";
import { useRolls } from "./hooks/useRolls";
import { useSongs } from "./hooks/useSongs";
import type { Song } from "./domain/types";
import { v4 as uuid } from "uuid";

function App() {
  const { dice, addDie } = useDice();
  const { rolls, addRoll } = useRolls();
  const { songs, addSong } = useSongs();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const diceById = React.useMemo(
    () => Object.fromEntries(dice.map((d) => [d.id, d])),
    [dice],
  );
  const rollsById = React.useMemo(
    () => Object.fromEntries(rolls.map((r) => [r.id, r])),
    [rolls],
  );

  function handleGroupSelected(rollIds: string[], songName: string) {
    const song: Song = {
      id: uuid(),
      name: songName,
      rollIds,
      createdAt: new Date().toISOString(),
    };
    addSong(song);
  }

  return (
    <div className={css({ maxW: "1200px", mx: "auto", p: 4 })}>
      <header className={css({ mb: 6 })}>
        <h1 className={css({ fontSize: "3xl", fontWeight: "bold" })}>
          Roll2Write
        </h1>
        <p>Create custom dice, roll them, and compose rolls into songs.</p>
      </header>
      <div
        className={css({
          display: "grid",
          gap: 4,
          gridTemplateColumns: { base: "1fr", md: "1fr 1fr 1fr" },
        })}
      >
        <div>
          <DiceForm
            existingDiceNames={dice.map((d) => d.name)}
            onCreated={addDie}
          />
          <DiceList
            dice={dice}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div>
          <Roller
            die={selectedId ? diceById[selectedId] : null}
            onRoll={addRoll}
          />
          <SongList songs={songs} rollsById={rollsById} diceById={diceById} />
        </div>
        <div>
          <RollHistory
            rolls={rolls}
            diceById={diceById}
            onGroupSelected={handleGroupSelected}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
