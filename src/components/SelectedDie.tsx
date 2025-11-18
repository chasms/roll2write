import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps } from "../utils/diceAppearance";
import { DieMesh } from "./DieMesh";

export interface SelectedDieProps {
  selectionId: string;
  die: DieDefinition;
  position: [number, number, number];
  clickGuardRef: { current: boolean };
  groupRefs: { current: Map<string, THREE.Group> };
  onPointerOver: () => void;
  onPointerOut: () => void;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent> | PointerEvent) => void;
  onRemoveSelected?: (selectionId: string) => void;
}

export const SelectedDie: React.FC<SelectedDieProps> = ({
  selectionId,
  die,
  position,
  clickGuardRef,
  groupRefs,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onRemoveSelected,
}) => {
  const { angle } = diePreviewSvgProps(die);
  const [x, y, z] = position;

  return (
    <group
      key={selectionId}
      // eslint-disable-next-line react/no-unknown-property
      position={[x, y, z]}
      ref={(g) => {
        if (g) groupRefs.current.set(selectionId, g);
        else groupRefs.current.delete(selectionId);
      }}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(event: THREE.Event) => {
        (event as unknown as { stopPropagation: () => void }).stopPropagation();
        if (clickGuardRef.current) return;
        clickGuardRef.current = true;
        onRemoveSelected?.(selectionId);
        setTimeout(() => {
          clickGuardRef.current = false;
        }, 0);
      }}
    >
      <DieMesh
        sides={die.sides}
        color={die.colorHex}
        pattern={die.pattern}
        angle={angle}
        appearance={die.appearance}
      />
      <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {die.name}
        </div>
      </Html>
    </group>
  );
};
