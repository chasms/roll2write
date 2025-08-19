import { css, cva } from "../../styled-system/css";
import type { DieDefinition } from "../domain/types";

interface DiceListProps {
  dice: DieDefinition[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const dieButtonClass = cva({
  base: { w: "full", textAlign: "left", mb: 1, px: 2, py: 1, rounded: "sm" },
  variants: {
    selected: {
      true: { bg: "green.600", color: "white" },
      false: {
        bg: { base: "gray.100", _dark: "gray.800" },
        color: { base: "black", _dark: "white" },
      },
    },
  },
  defaultVariants: { selected: false },
});

export function DiceList({ dice, selectedId, onSelect }: DiceListProps) {
  return (
    <div className={css({ border: "1px solid", p: 2, rounded: "md", mb: 4 })}>
      <h2>Dice</h2>
      {dice.length === 0 && <p>No dice yet.</p>}
      <ul className={css({ listStyle: "none", m: 0, p: 0 })}>
        {dice.map((d) => (
          <li key={d.id}>
            <button
              className={dieButtonClass({ selected: d.id === selectedId })}
              onClick={() => {
                onSelect(d.id);
              }}
            >
              {d.name} (d{d.sides})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
