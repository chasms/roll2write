import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps, patternBackground, polygonPoints } from "../utils/diceAppearance";
import {
  DIE_THUMBNAIL_SIZE,
  dieThumbnailContentOverlayClass,
  dieThumbnailOuterClass,
} from "./styles/DieThumbnail.styles.ts";

export interface DieThumbnail2DProps {
  die: DieDefinition;
  onClick?: () => void;
  showOption?: string | null;
}

export function DieThumbnail2D({ die, onClick, showOption }: DieThumbnail2DProps) {
  const { angle } = diePreviewSvgProps(die);
  const size = DIE_THUMBNAIL_SIZE;
  const points = polygonPoints(die.sides, size / 2)
    .split(" ")
    .map((pair) => {
      const [x, y] = pair.split(",");
      return x + "," + y;
    })
    .join(" ");
  const background = patternBackground(die.pattern, die.colorHex);
  return (
    <div
      className={dieThumbnailOuterClass({ interactive: Boolean(onClick) })}
      style={{ width: size, height: size, aspectRatio: "1 / 1" }}
      onClick={onClick}
      aria-label={die.name + " (" + String(die.sides) + " sides)"}
    >
      <svg
        width={size}
        height={size}
        viewBox={"0 0 " + String(size) + " " + String(size)}
        style={{ transform: "rotate(" + String(angle) + "deg)" }}
      >
        <polygon points={points} fill={background} stroke="#222" strokeWidth={2} />
      </svg>
      <div className={dieThumbnailContentOverlayClass}>{showOption ?? die.name}</div>
    </div>
  );
}
