import { useState } from "react";
import { v4 as uuid } from "uuid";
import { css, cva } from "../../styled-system/css";
import type { DieDefinition, RollResult } from "../domain/types";

interface RollerProps {
  die: DieDefinition | null;
  onRoll: (roll: RollResult) => void;
}

// Fallback spinner using CSS animation name defined globally in index.css (can be added if absent).

const rollButtonClass = cva({
  base: { px: 4, py: 2, rounded: "sm", bg: "purple.600", color: "white" },
  variants: {
    disabled: { true: { opacity: 0.5, cursor: "not-allowed" }, false: {} },
  },
  defaultVariants: { disabled: false },
});

export function Roller({ die, onRoll }: RollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  function handleRollClick() {
    if (!die || isRolling) return;
    const currentDie = die; // capture stable reference for timeout closure
    setIsRolling(true);
    setTimeout(() => {
      const sideIndex = Math.floor(Math.random() * currentDie.sides);
      const roll: RollResult = {
        id: uuid(),
        dieId: currentDie.id,
        sideIndex,
        option: currentDie.options[sideIndex],
        timestamp: new Date().toISOString(),
      };
      setLastRoll(roll);
      onRoll(roll);
      setIsRolling(false);
    }, 1000);
  }

  const rollerContainerClass = css({
    border: "1px solid",
    p: 4,
    rounded: "md",
    mb: 4,
  });
  const spinnerContainerClass = css({ mt: 4, h: 16 });
  const spinnerClass = css({
    w: 12,
    h: 12,
    animation: "spin 0.7s linear infinite",
  });
  const lastResultClass = css({
    textAlign: "center",
    fontSize: "xl",
    fontWeight: "bold",
  });

  return (
    <div className={rollerContainerClass}>
      <h2>Roller</h2>
      {!die && <p>Select a die to roll.</p>}
      {die && (
        <div>
          <p>
            Selected: <strong>{die.name}</strong> (d{die.sides})
          </p>
          <button
            disabled={isRolling}
            onClick={handleRollClick}
            className={rollButtonClass({ disabled: isRolling })}
          >
            {isRolling ? "Rolling..." : "Roll"}
          </button>
          <div className={spinnerContainerClass}>
            {isRolling && <div className={spinnerClass} />}
            {lastRoll && !isRolling && (
              <div className={lastResultClass}>{lastRoll.option}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
