import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { classNamesFunc } from "classnames-generics";
import * as React from "react";
import * as THREE from "three";
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

function RotatingDie({ die }: { die: DieDefinition }) {
  const { angle } = diePreviewSvgProps(die);
  const groupRef = React.useRef<THREE.Group | null>(null);
  const draggingRef = React.useRef<{
    startX: number;
    startY: number;
    startRotX: number;
    startRotY: number;
    moved: boolean;
    lastAngleX: number;
    lastAngleY: number;
    lastTs: number;
  } | null>(null);
  const inertiaRef = React.useRef<{ vx: number; vy: number } | null>(null);

  const endDrag = (e: ThreeEvent<PointerEvent> | PointerEvent) => {
    const d = draggingRef.current;
    if (d?.moved) {
      (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
    }
    draggingRef.current = null;
  };

  const beginDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!groupRef.current) return;
    e.stopPropagation();
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRotX: groupRef.current.rotation.x,
      startRotY: groupRef.current.rotation.y,
      moved: false,
      lastAngleX: groupRef.current.rotation.x,
      lastAngleY: groupRef.current.rotation.y,
      lastTs: e.timeStamp,
    };
  };

  const onDragMove = (e: ThreeEvent<PointerEvent>) => {
    const d = draggingRef.current;
    if (!d || !groupRef.current) return;
    if (!e.buttons) {
      endDrag(e);
      return;
    }
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true;
    const sens = 0.01;
    groupRef.current.rotation.y = d.startRotY + dx * sens;
    groupRef.current.rotation.x = Math.max(
      -1.2,
      Math.min(1.2, d.startRotX + dy * sens)
    );
    const dtMs = Math.max(1, e.timeStamp - d.lastTs);
    const dt = dtMs / 1000;
    const vx = (groupRef.current.rotation.x - d.lastAngleX) / dt;
    const vy = (groupRef.current.rotation.y - d.lastAngleY) / dt;
    d.lastAngleX = groupRef.current.rotation.x;
    d.lastAngleY = groupRef.current.rotation.y;
    d.lastTs = e.timeStamp;
    inertiaRef.current = { vx, vy };
  };

  React.useEffect(() => {
    const handler = (evt: PointerEvent) => {
      endDrag(evt);
    };
    window.addEventListener("pointerup", handler);
    window.addEventListener("pointercancel", handler);
    return () => {
      window.removeEventListener("pointerup", handler);
      window.removeEventListener("pointercancel", handler);
    };
  }, []);

  useFrame((_, delta) => {
    if (draggingRef.current) return; // active drag overrides inertia
    const inert = inertiaRef.current;
    if (!inert || !groupRef.current) return;
    const damp = Math.pow(0.08, delta); // slightly faster decay
    groupRef.current.rotation.x = Math.max(
      -1.2,
      Math.min(1.2, groupRef.current.rotation.x + inert.vx * delta)
    );
    groupRef.current.rotation.y += inert.vy * delta;
    inert.vx *= damp;
    inert.vy *= damp;
    if (Math.abs(inert.vx) < 0.01 && Math.abs(inert.vy) < 0.01) {
      inertiaRef.current = null;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={beginDrag}
      onPointerMove={onDragMove}
      onPointerUp={endDrag}
    >
      <DieMesh
        sides={die.sides}
        color={die.colorHex}
        pattern={die.pattern}
        angle={angle}
        appearance={die.appearance}
      />
    </group>
  );
}

export function DieThumbnail({
  die,
  onClick,
  showOption,
  size,
}: DieThumbnailProps) {
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
        <RotatingDie die={die} />
      </Canvas>
      <div className={styles["content-overlay"]}>{showOption ?? die.name}</div>
    </div>
  );
}
