import type { DieDefinition, RollResult } from "../domain/types";
import { BottomDrawer } from "./BottomDrawer";
import { DieThumbnail } from "./DieThumbnail";

interface PastRollsDrawerProps {
  rolls: RollResult[];
  diceById: Record<string, DieDefinition>;
  onSelectRoll: (roll: RollResult) => void;
}

export function PastRollsDrawer({ rolls, diceById, onSelectRoll }: PastRollsDrawerProps) {
  const recent = rolls.slice(0, 50);
  return (
    <BottomDrawer title="Past Rolls">
      {recent.map((r) => {
        const die = diceById[r.dieId];
        return (
          <DieThumbnail
            key={r.id}
            die={die}
            showOption={r.option}
            onClick={() => {
              onSelectRoll(r);
            }}
          />
        );
      })}
    </BottomDrawer>
  );
}
