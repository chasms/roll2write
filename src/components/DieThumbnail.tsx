import { css, cva } from "../../styled-system/css";
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps, patternBackground } from "../utils/diceAppearance";

interface DieThumbnailProps {
  die: DieDefinition;
  onClick?: () => void;
  showOption?: string | null;
}

const dieThumbnailOuterClass = cva({
  base: {
    w: 24, // static tokens instead of dynamic inline size
    h: 24,
    position: "relative",
    userSelect: "none",
    transition: "transform 0.15s",
  },
  variants: {
    interactive: {
      true: { cursor: "pointer", _hover: { transform: "scale(1.05)" } },
      false: { cursor: "default" },
    },
  },
  defaultVariants: { interactive: false },
});

const dieThumbnailInnerOverlayClass = css({
  position: "absolute",
  inset: 0,
  borderRadius: "sm",
  boxShadow: "md",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "xs",
  fontWeight: "bold",
  textAlign: "center",
  px: 1,
  lineHeight: 1.1,
});

export function DieThumbnail({ die, onClick, showOption }: DieThumbnailProps) {
  const { angle, points } = diePreviewSvgProps(die);
  const background = patternBackground(die.pattern, die.colorHex);
  return (
    <div
      className={dieThumbnailOuterClass({ interactive: Boolean(onClick) })}
      style={{ transform: `rotate(${String(angle)}deg)` }}
      onClick={onClick}
    >
      <svg width={96} height={96} viewBox="0 0 96 96">
        <polygon points={points} fill={die.pattern === "dots" ? die.colorHex : "none"} stroke="#222" strokeWidth={2} />
      </svg>
      <div className={dieThumbnailInnerOverlayClass} style={{ background }}>
        {showOption ?? die.name}
      </div>
    </div>
  );
}
