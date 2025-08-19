import { useState } from "react";
import { css } from "../../styled-system/css";
import type { DieDefinition, RollResult } from "../domain/types";

interface RollHistoryProps {
  rolls: RollResult[];
  diceById: Record<string, DieDefinition>;
  onGroupSelected: (rollIds: string[], songName: string) => void;
}

export function RollHistory({
  rolls,
  diceById,
  onGroupSelected,
}: RollHistoryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [songName, setSongName] = useState("");

  function toggle(id: string) {
    setSelected((previousSelected) => {
      const nextSelected = new Set(previousSelected);
      if (nextSelected.has(id)) {
        nextSelected.delete(id);
      } else {
        nextSelected.add(id);
      }
      return nextSelected;
    });
  }
  function createSong() {
    if (!songName.trim() || selected.size === 0) return;
    onGroupSelected(Array.from(selected), songName.trim());
    setSelected(new Set());
    setSongName("");
  }

  return (
    <div className={css({ border: "1px solid", p: 4, rounded: "md", mb: 4 })}>
      <h2>Roll History</h2>
      {rolls.length === 0 && <p>No rolls yet.</p>}
      <ul
        className={css({
          listStyle: "none",
          m: 0,
          p: 0,
          maxH: 64,
          overflowY: "auto",
        })}
      >
        {rolls.map((r) => (
          <li key={r.id} className={css({ mb: 1 })}>
            <label
              className={css({ display: "flex", alignItems: "center", gap: 2 })}
            >
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => {
                  toggle(r.id);
                }}
                className={css({})}
              />
              <span className={css({ flex: 1 })}>
                <strong>{diceById[r.dieId].name}</strong>: {r.option}
                <span
                  className={css({ color: "gray.500", fontSize: "sm", ml: 2 })}
                >
                  {new Date(r.timestamp).toLocaleTimeString()}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className={css({ mt: 2 })}>
        <input
          placeholder="Song name"
          value={songName}
          onChange={(e) => {
            setSongName(e.target.value);
          }}
          className={css({ border: "1px solid", px: 2, py: 1, mr: 2 })}
        />
        <button
          disabled={selected.size === 0 || !songName.trim()}
          onClick={createSong}
          className={css({
            px: 3,
            py: 1,
            bg: "teal.600",
            color: "white",
            rounded: "sm",
            _disabled: { opacity: 0.5 },
          })}
        >
          Create Song
        </button>
      </div>
    </div>
  );
}
