import { Canvas } from "@react-three/fiber";
import { classNamesFunc } from "classnames-generics";
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps } from "../utils/diceAppearance";
import { DieMesh } from "./DieMesh";
import styles from "./DieThumbnail.module.scss";

export const DIE_THUMBNAIL_SIZE = 60; // default size constant

const classNames = classNamesFunc<keyof typeof styles>();

export interface DieThumbnailProps {
  die: DieDefinition;
  onClick?: () => void;
  showOption?: string | null;
  size?: number | string; // px number or css size (width); height auto via aspect ratio
}

export function DieThumbnail({
  die,
  onClick,
  showOption,
  size,
}: DieThumbnailProps) {
  const { angle } = diePreviewSvgProps(die);
  const resolvedSize = size ?? DIE_THUMBNAIL_SIZE;
  return (
    <div
      className={classNames(styles.outer, { [styles.interactive]: !!onClick })}
      style={{ width: resolvedSize, height: "auto" }}
      onClick={onClick}
      aria-label={die.name + " (" + String(die.sides) + " sides)"}
    >
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          overflow: "visible",
        }}
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.65} />

        {/* eslint-disable-next-line react/no-unknown-property */}
        <directionalLight position={[3, 4, 5]} intensity={0.9} />

        {/* eslint-disable-next-line react/no-unknown-property */}
        <directionalLight position={[-4, -3, 5]} intensity={0.3} />

        <DieMesh
          sides={die.sides}
          color={die.colorHex}
          pattern={die.pattern}
          angle={angle}
          appearance={die.appearance}
        />
      </Canvas>
      <div className={styles["content-overlay"]}>{showOption ?? die.name}</div>
    </div>
  );
}
