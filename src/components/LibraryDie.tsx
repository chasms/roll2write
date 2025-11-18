import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps } from "../utils/diceAppearance";
import { DieMesh } from "./DieMesh";

export interface LibraryDieProps {
  die: DieDefinition;
  position: [number, number, number];
  isHovered: boolean;
  clickGuardRef: { current: boolean };
  groupRefs: { current: Map<string, THREE.Group> };
  onPointerOver: () => void;
  onPointerOut: () => void;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent> | PointerEvent) => void;
  onAddFromLibrary?: (dieId: string) => void;
  onEditLibraryDie?: (dieId: string) => void;
}

export const LibraryDie: React.FC<LibraryDieProps> = ({
  die,
  position,
  isHovered,
  clickGuardRef,
  groupRefs,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onAddFromLibrary,
  onEditLibraryDie,
}) => {
  const { angle } = diePreviewSvgProps(die);
  const [x, y, z] = position;

  return (
    <group
      key={die.id}
      // eslint-disable-next-line react/no-unknown-property
      position={[x, y, z]}
      ref={(group) => {
        if (group) groupRefs.current.set(die.id, group);
        else groupRefs.current.delete(die.id);
      }}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e: THREE.Event) => {
        (e as unknown as { stopPropagation: () => void }).stopPropagation();
        if (clickGuardRef.current) return;
        clickGuardRef.current = true;
        onAddFromLibrary?.(die.id);
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
            color: "#d1d5db",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {die.name}
        </div>
      </Html>
      {isHovered && onEditLibraryDie && (
        <Html
          position={[0, 0.8, 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              clickGuardRef.current = true;
              onEditLibraryDie(die.id);
              setTimeout(() => {
                clickGuardRef.current = false;
              }, 0);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#fff",
              background: "rgba(79, 70, 229, 0.9)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              transition: "background 0.2s",
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(79, 70, 229, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(79, 70, 229, 0.9)";
            }}
            title="Edit die"
          >
            ✏️ Edit
          </button>
        </Html>
      )}
    </group>
  );
};
