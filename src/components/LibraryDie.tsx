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
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
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
  const [isEditButtonHovered, setIsEditButtonHovered] = React.useState(false);
  const editButtonClickGuardRef = React.useRef(false);

  const { angle } = diePreviewSvgProps(die);
  const [x, y, z] = position;

  const dieObjectName = `die-${die.id}`;
  const editButtonObjectName = `edit-${die.id}`;

  return (
    <>
      <group
        key={die.id}
        name={dieObjectName}
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
        onClick={(e) => {
          // Unfortunately this method triggers every time an edit button is clicked
          // and editButtonHovered is always false here because onPointerOut of the edit button triggers onClick
          // So we need to wait to see if an edit click is happening (it unreliably triggers before and after this method), and then block
          setTimeout(() => {
            console.log("DIE CLICK", "\n");
            console.log(
              "editButtonClickGuardRef.current",
              editButtonClickGuardRef.current,
              "\n"
            );
            if (
              clickGuardRef.current ||
              editButtonClickGuardRef.current ||
              e.object.parent?.parent?.name !== dieObjectName
            ) {
              return;
            }
            clickGuardRef.current = true;
            onAddFromLibrary?.(die.id);
            // Must setTimout to prevent race conditions of many clicks
            setTimeout(() => {
              clickGuardRef.current = false;
            }, 1);
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
      </group>

      {/* 3D Edit Button - separate group positioned independently to avoid rotation,
      Only visible if in Dice Library - invisible in Selected Dice */}
      {onEditLibraryDie && (
        <group
          name={editButtonObjectName}
          // eslint-disable-next-line react/no-unknown-property
          position={[x + 1.2, y - 0.8, z]}
          onClick={(e) => {
            console.log("EDIT CLICK", e, "\n");
            console.log("e.object.parent?.name", e.object.parent?.name, "\n");
            console.log(
              "e.object.parent?.name === editButtonObjectName",
              e.object.parent?.name === editButtonObjectName,
              "\n"
            );
            e.stopPropagation();
            if (
              editButtonClickGuardRef.current ||
              e.object.parent?.name !== editButtonObjectName
            )
              return;
            editButtonClickGuardRef.current = true;
            onEditLibraryDie(die.id);
            setTimeout(() => {
              editButtonClickGuardRef.current = false;
            }, 10);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsEditButtonHovered(true);
          }}
          onPointerOut={(e) => {
            // unfortunately this triggers on click, making editButtonHovered useless for preventing the Die's onClick behavior
            e.stopPropagation();
            setIsEditButtonHovered(false);
          }}
        >
          {/* Button background */}
          <mesh>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <planeGeometry args={[0.8, 0.35]} />
            <meshBasicMaterial
              color={isEditButtonHovered ? "#6366f1" : "#4f46e5"}
              // eslint-disable-next-line react/no-unknown-property
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Button label */}
          <Html
            center
            position={[0, 0, 0.01]}
            style={{ pointerEvents: "none" }}
            zIndexRange={[30, 0]}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#fff",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              ✏️ Edit
            </div>
          </Html>
        </group>
      )}
    </>
  );
};
