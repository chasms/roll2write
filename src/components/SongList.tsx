import { useState } from "react";
import { css } from "../../styled-system/css";
import type { DieDefinition, RollResult, Song } from "../domain/types";

interface SongListProps {
  songs: Song[];
  rollsById: Record<string, RollResult>;
  diceById: Record<string, DieDefinition>;
}

export function SongList({ songs, rollsById, diceById }: SongListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className={css({ border: "1px solid", p: 4, rounded: "md", mb: 4 })}>
      <h2>Songs</h2>
      {songs.length === 0 && <p>No songs yet.</p>}
      <ul className={css({ listStyle: "none", m: 0, p: 0 })}>
        {songs.map((song) => {
          const isOpen = song.id === openId;
          return (
            <li key={song.id} className={css({ mb: 2 })}>
              <button
                onClick={() => {
                  setOpenId(isOpen ? null : song.id);
                }}
                className={css({
                  w: "full",
                  textAlign: "left",
                  px: 2,
                  py: 1,
                  bg: "orange.600",
                  color: "white",
                  rounded: "sm",
                })}
              >
                {song.name} ({song.rollIds.length} rolls)
              </button>
              {isOpen && (
                <ol className={css({ mt: 2, ml: 4 })}>
                  {song.rollIds.map((rollId) => {
                    const roll = rollsById[rollId];
                    const die = diceById[roll.dieId];
                    return (
                      <li key={rollId} className={css({ mb: 1 })}>
                        <strong>{die.name}</strong>: {roll.option}
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
