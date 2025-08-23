import React from "react";
import { css } from "../../styled-system/css";
import type { DieDefinition, RollResult } from "../domain/types";
import { DieThumbnail } from "./DieThumbnail";

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
    <div
      aria-hidden={!open}
      className={css({
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: { base: "100%", md: 80 },
        transform: open ? "translateX(0)" : { base: "translateX(100%)", md: "translateX(100%)" },
        transition: "transform 0.35s cubic-bezier(.4,.0,.2,1)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
      })}
      style={{
        background: "rgba(15,12,22,0.82)",
        borderLeft: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.55), 0 0 28px -6px rgba(123,93,249,0.55)",
      }}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          py: 3,
          borderBottom: "1px solid",
        })}
        style={{ borderColor: "rgba(255,255,255,0.15)", color: "#ebe5d7" }}
      >
        <h3 className={css({ m: 0, fontSize: "lg", fontWeight: "semibold" })}>Past Rolls</h3>
        <button
          onClick={onClose}
          className={css({ fontSize: "sm", px: 3, py: 1, rounded: "sm", cursor: "pointer" })}
          style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          Close
        </button>
      </div>
      <div
        className={css({
          flex: 1,
          overflowY: "auto",
          p: 4,
          display: "grid",
          gap: 4,
          gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))",
        })}
      >
        {recent.length === 0 && <p className={css({ fontSize: "sm", color: "gray.300", m: 0 })}>No rolls yet.</p>}
        {recent.map((r) => {
          const die = diceById[r.dieId];
          if (!die) return null;
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
