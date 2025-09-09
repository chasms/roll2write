import React from "react";
import type { DieDefinition, RollResult } from "../domain/types";
import { DieThumbnail } from "./DieThumbnail";
import styles from "./PastRollsSidebar.module.scss";

interface PastRollsSidebarProps {
  open: boolean;
  onClose: () => void;
  rolls: RollResult[];
  diceById: Record<string, DieDefinition>;
  onSelectRoll?: (roll: RollResult) => void;
}

export const PastRollsSidebar: React.FC<PastRollsSidebarProps> = ({ open, onClose, rolls, diceById, onSelectRoll }) => {
  const recent = React.useMemo(
    () => [...rolls].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 200),
    [rolls]
  );
  return (
    <div aria-hidden={!open} className={[styles.sidebar, open && styles.open].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>Past Rolls</h3>
        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
      <div className={styles.grid}>
        {recent.length === 0 && <p className={styles.empty}>No rolls yet.</p>}
        {recent.map((r) => {
          const die = diceById[r.dieId];
          return (
            <DieThumbnail
              key={r.id}
              die={die}
              showOption={r.option}
              size={72}
              onClick={() => {
                onSelectRoll?.(r);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
