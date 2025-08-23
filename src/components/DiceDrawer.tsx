import { v4 as uuid } from "uuid";
import { cx } from "../../styled-system/css";
import type { DieDefinition, RollResult } from "../domain/types";
import { BottomDrawer } from "./BottomDrawer";
import { Button } from "./Button";
import { DieThumbnail } from "./DieThumbnail";
import { diceWrapperClass, editButtonInnerAdjustClass, editButtonPositionClass } from "./styles/DiceDrawer.styles";

interface DiceDrawerProps {
  dice: DieDefinition[];
  onRoll: (roll: RollResult) => void;
  onOpenCreate: () => void;
  onOpenEdit: (die: DieDefinition) => void;
}

export function DiceDrawer({ dice, onRoll, onOpenCreate, onOpenEdit }: DiceDrawerProps) {
  function rollDie(die: DieDefinition) {
    const sideIndex = Math.floor(Math.random() * die.sides);
    const roll: RollResult = {
      id: uuid(),
      dieId: die.id,
      sideIndex,
      option: die.options[sideIndex],
      timestamp: new Date().toISOString(),
    };
    onRoll(roll);
  }
  return (
    <BottomDrawer title="Dice">
      {dice.map((d) => {
        return (
          <div key={d.id} className={diceWrapperClass}>
            <DieThumbnail
              die={d}
              size={56}
              onClick={() => {
                rollDie(d);
              }}
            />
            <Button
              variant="ghost"
              width={20}
              height={20}
              aria-label="Edit die"
              title="Edit die"
              className={cx(editButtonPositionClass, editButtonInnerAdjustClass)}
              onClick={(e) => {
                e.stopPropagation();
                onOpenEdit(d);
              }}
            >
              i
            </Button>
          </div>
        );
      })}
      <Button onClick={onOpenCreate} variant="primary" width={96} height={96} title="Create Die">
        + 🎲
      </Button>
    </BottomDrawer>
  );
}
