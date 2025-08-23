import { Canvas } from "@react-three/fiber";
/* eslint-disable react/no-unknown-property */
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps } from "../utils/diceAppearance";
import { DieMesh } from "./DieMesh";
import {
  DIE_THUMBNAIL_SIZE,
  dieThumbnailContentOverlayClass,
  dieThumbnailOuterClass,
} from "./styles/DieThumbnail.styles.ts";

export interface DieThumbnailProps {
  die: DieDefinition;
  onClick?: () => void;
  showOption?: string | null;
  size?: number | string; // px number or css size (width); height auto via aspect ratio
}

export function DieThumbnail({ die, onClick, showOption, size }: DieThumbnailProps) {
  const { angle } = diePreviewSvgProps(die);
  const resolvedSize = size ?? DIE_THUMBNAIL_SIZE;
  return (
    <div
      className={dieThumbnailOuterClass({ interactive: Boolean(onClick) })}
      style={{ width: resolvedSize, height: "auto" }}
      onClick={onClick}
      aria-label={die.name + " (" + String(die.sides) + " sides)"}
    >
      <Canvas
        style={{ width: "100%", height: "100%", background: "transparent", overflow: "visible" }}
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={0.9} />
        <directionalLight position={[-4, -3, 5]} intensity={0.3} />
        <DieMesh
          sides={die.sides}
          color={die.colorHex}
          pattern={die.pattern}
          angle={angle}
          appearance={die.appearance}
        />
      </Canvas>
      <div className={dieThumbnailContentOverlayClass}>{showOption ?? die.name}</div>
    </div>
  );
}
