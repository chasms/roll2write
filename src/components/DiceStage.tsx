import { Html, useCursor } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import type { DieDefinition } from "../domain/types";
import { diePreviewSvgProps } from "../utils/diceAppearance";
import { DieMesh } from "./DieMesh";

export interface DiceStageProps {
  mode: "selected" | "library";
  selected: { id: string; die: DieDefinition }[];
  library: DieDefinition[];
  onAddFromLibrary?: (dieId: string) => void;
  onRemoveSelected?: (selectionId: string) => void;
  height?: number; // fixed height (no scroll) if provided and maxHeight is undefined
  maxHeight?: number; // scroll container max height; Canvas grows to fit content and scrolls if needed
  rowPx?: number; // approximate pixels per grid row when auto-sizing canvas within scroll container
  cameraZ?: number; // override camera distance (default 12)
  cameraFov?: number; // override camera fov (default 40)
  rollPulse?: number; // when changed, briefly spin selected dice
}

function gridPositions(
  count: number,
  cols: number,
  cell: number,
  originX: number,
  originY = 0
) {
  const poses: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = originX + (c - (cols - 1) / 2) * cell;
    const y = originY - (r - 0) * cell;
    poses.push([x, y, 0]);
  }
  return poses;
}

function StageScene({
  mode,
  selected,
  library,
  onAddFromLibrary,
  onRemoveSelected,
  rollPulse,
}: Omit<DiceStageProps, "height">) {
  // layout inside Canvas (centered grid per mode)
  // Constant column count so dice size remains stable; we will scale positions instead
  const selectedCols = 5;
  const libraryCols = 5; // constant column count for library
  const cellSelected = 2.4; // match library to keep dice apparent size consistent
  const cellLibrary = 2.4;
  // Fixed spacing; no compression to avoid snapping when transitioning rows
  const selectedPos = useMemo(
    () => gridPositions(selected.length, selectedCols, cellSelected, 0),
    [selected.length]
  );
  const libraryPos = useMemo(
    () => gridPositions(library.length, libraryCols, cellLibrary, 0, 0),
    [library.length]
  );

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  useCursor(!!hoveredId);

  // Guard against duplicate onClick invocations from multiple child intersections
  const clickGuardRef = React.useRef(false);
  const withClickGuard = React.useCallback((fn: () => void) => {
    if (clickGuardRef.current) return;
    clickGuardRef.current = true;
    try {
      fn();
    } finally {
      // release on next macrotask to collapse same-frame duplicates
      setTimeout(() => {
        clickGuardRef.current = false;
      }, 0);
    }
  }, []);

  // Drag-to-rotate state
  const draggingRef = React.useRef<{
    id: string;
    startX: number;
    startY: number;
    startRotX: number;
    startRotY: number;
    moved: boolean;
    lastAngleX: number;
    lastAngleY: number;
    lastTs: number; // milliseconds
    lastVX: number; // last computed angular velocity x (rad/s)
    lastVY: number; // last computed angular velocity y (rad/s)
  } | null>(null);
  // Single ref map for this canvas' dice
  const groupRefs = React.useRef<Map<string, THREE.Group>>(new Map());
  // Inertial angular velocities (radians per second) for this canvas
  const inertia = React.useRef<Map<string, { vx: number; vy: number }>>(
    new Map()
  );
  const beginDrag = (event: ThreeEvent<PointerEvent>, id: string) => {
    const group = groupRefs.current.get(id) ?? null;
    if (!group) return; // shouldn't happen
    event.stopPropagation();
    // Clear any existing inertia for this die while actively dragging
    inertia.current.delete(id);
    draggingRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startRotX: group.rotation.x,
      startRotY: group.rotation.y,
      moved: false,
      lastAngleX: group.rotation.x,
      lastAngleY: group.rotation.y,
      lastTs: event.timeStamp,
      lastVX: 0,
      lastVY: 0,
    };
  };

  const onDragMove = (event: ThreeEvent<PointerEvent>) => {
    const draggable = draggingRef.current;
    if (!draggable) return;
    // If button is no longer pressed, finish drag immediately
    if (!event.buttons) {
      endDrag(event);
      return;
    }
    const group = groupRefs.current.get(draggable.id);
    if (!group) return;
    const dx = event.clientX - draggable.startX;
    const dy = event.clientY - draggable.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) draggable.moved = true;
    const sensitivity = 0.01;
    const nextY = draggable.startRotY + dx * sensitivity;
    const nextX = draggable.startRotX + dy * sensitivity;
    group.rotation.y = nextY;
    // clamp x tilt a bit so it doesn't flip wildly
    group.rotation.x = Math.max(-1.2, Math.min(1.2, nextX));
    // Update instantaneous angular velocity for inertia
    const dtMs = Math.max(1, event.timeStamp - draggable.lastTs);
    const dt = dtMs / 1000;
    const vx = (group.rotation.x - draggable.lastAngleX) / dt; // rad/s
    const vy = (group.rotation.y - draggable.lastAngleY) / dt; // rad/s
    draggable.lastAngleX = group.rotation.x;
    draggable.lastAngleY = group.rotation.y;
    draggable.lastTs = event.timeStamp;
    draggable.lastVX = vx;
    draggable.lastVY = vy;
  };
  const endDrag = (event: ThreeEvent<PointerEvent> | PointerEvent) => {
    const draggable = draggingRef.current;
    if (!draggable) return;
    const group = groupRefs.current.get(draggable.id);
    // Commit inertia regardless of movement threshold (for smooth continuation)
    if (group) {
      // If there were no move events (click-only), estimate velocity from lastAngle deltas
      let vx = draggable.lastVX;
      let vy = draggable.lastVY;
      if (!draggable.moved) {
        const dtMs = Math.max(
          1,
          (event as PointerEvent).timeStamp - draggable.lastTs
        );
        const dt = dtMs / 1000;
        // Using difference between current rotation and recorded lastAngle (likely zero) -> velocity near 0 (no inertia)
        vx = (group.rotation.x - draggable.lastAngleX) / dt;
        vy = (group.rotation.y - draggable.lastAngleY) / dt;
      }
      if (Math.abs(vx) > 0.0001 || Math.abs(vy) > 0.0001) {
        inertia.current.set(draggable.id, { vx, vy });
      }
    }
    // Only swallow click + engage guard if movement exceeded threshold
    if (draggable.moved) {
      if (
        "stopPropagation" in event &&
        typeof event.stopPropagation === "function"
      ) {
        event.stopPropagation();
      }
      clickGuardRef.current = true;
      setTimeout(() => {
        clickGuardRef.current = false;
      }, 0);
    }
    draggingRef.current = null;
  };

  // End drag even if pointer is released off the object
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

  const spinUntilRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (typeof rollPulse === "number") {
      spinUntilRef.current = performance.now() + 900;
    }
  }, [rollPulse]);

  useFrame((_, delta) => {
    const now = performance.now();
    if (now < spinUntilRef.current && mode === "selected") {
      const speed = 5.2;
      groupRefs.current.forEach((g) => {
        g.rotation.y += delta * speed;
      });
    }
    // Apply inertia with exponential damping
    const dampFactor = Math.pow(0.1, delta); // ~0.1x per second
    inertia.current.forEach((v, id) => {
      const g = groupRefs.current.get(id);
      if (!g) {
        inertia.current.delete(id);
        return;
      }
      g.rotation.x = Math.max(-1.2, Math.min(1.2, g.rotation.x + v.vx * delta));
      g.rotation.y += v.vy * delta;
      v.vx *= dampFactor;
      v.vy *= dampFactor;
      if (Math.abs(v.vx) < 0.01 && Math.abs(v.vy) < 0.01) {
        inertia.current.delete(id);
      }
    });
  });

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.7} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[6, 8, 6]} intensity={0.9} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[-6, -8, 6]} intensity={0.3} />

      {/* Pixel-size stabilization: scale dice inversely to canvas height changes to eliminate perceived zoom */}
      <PixelStableGroup>
        {mode === "selected"
          ? selected.map((sel, i) => {
              const die = sel.die;
              const { angle } = diePreviewSvgProps(die);
              const [x, y, z] = selectedPos[i] ?? [0, 0, 0];
              return (
                <group
                  key={sel.id}
                  // eslint-disable-next-line react/no-unknown-property
                  position={[x, y, z]}
                  ref={(g) => {
                    if (g) groupRefs.current.set(sel.id, g);
                    else groupRefs.current.delete(sel.id);
                  }}
                  onPointerOver={() => {
                    setHoveredId(sel.id);
                  }}
                  onPointerOut={() => {
                    setHoveredId((h) => (h === sel.id ? null : h));
                  }}
                  onPointerDown={(e) => {
                    beginDrag(e, sel.id);
                  }}
                  onPointerMove={onDragMove}
                  onPointerUp={endDrag}
                  onClick={(event: THREE.Event) => {
                    // r3f events extend Three's Event; stop propagation to parent groups/canvas
                    (
                      event as unknown as { stopPropagation: () => void }
                    ).stopPropagation();
                    withClickGuard(() => {
                      onRemoveSelected?.(sel.id);
                    });
                  }}
                >
                  <DieMesh
                    sides={die.sides}
                    color={die.colorHex}
                    pattern={die.pattern}
                    angle={angle}
                    appearance={die.appearance}
                  />
                  <Html
                    center
                    distanceFactor={9}
                    style={{ pointerEvents: "none" }}
                  >
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
            })
          : library.map((die, i) => {
              const { angle } = diePreviewSvgProps(die);
              const [x, y, z] = libraryPos[i] ?? [0, 0, 0];
              return (
                <group
                  key={die.id}
                  // eslint-disable-next-line react/no-unknown-property
                  position={[x, y, z]}
                  ref={(group) => {
                    if (group) groupRefs.current.set(die.id, group);
                    else groupRefs.current.delete(die.id);
                  }}
                  onPointerOver={() => {
                    setHoveredId(die.id);
                  }}
                  onPointerOut={() => {
                    setHoveredId((h) => (h === die.id ? null : h));
                  }}
                  onPointerDown={(e) => {
                    beginDrag(e, die.id);
                  }}
                  onPointerMove={onDragMove}
                  onPointerUp={endDrag}
                  onClick={(e: THREE.Event) => {
                    (
                      e as unknown as { stopPropagation: () => void }
                    ).stopPropagation();
                    withClickGuard(() => {
                      onAddFromLibrary?.(die.id);
                    });
                  }}
                >
                  <DieMesh
                    sides={die.sides}
                    color={die.colorHex}
                    pattern={die.pattern}
                    angle={angle}
                    appearance={die.appearance}
                  />
                  <Html
                    center
                    distanceFactor={9}
                    style={{ pointerEvents: "none" }}
                  >
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
              );
            })}
      </PixelStableGroup>
    </>
  );
}

// Wrapper that keeps a constant visual scale regardless of canvas pixel height changes
function PixelStableGroup({ children }: { children: React.ReactNode }) {
  const size = useThree((s) => s.size);
  const baseHeightRef = React.useRef<number | null>(null);
  baseHeightRef.current ??= size.height;
  const scale = baseHeightRef.current / size.height;
  return <group scale={[scale, scale, scale]}>{children}</group>;
}

export const DiceStage: React.FC<DiceStageProps> = ({
  mode,
  selected,
  library,
  onAddFromLibrary,
  onRemoveSelected,
  height = 420,
  maxHeight,
  rowPx = 120,
  cameraZ = 12,
  cameraFov = 40,
  rollPulse,
}) => {
  // compute grid rows to size the canvas when using a scroll container
  const selectedCols = 5; // keep constant so Canvas height & camera stable
  const libraryCols = 5;
  const rows =
    mode === "selected"
      ? Math.max(1, Math.ceil((selected.length || 1) / selectedCols))
      : Math.max(1, Math.ceil((library.length || 1) / libraryCols));
  const contentHeight = rows * rowPx + Math.round(rowPx * 0.25); // precise height + small buffer
  // Prevent perceived zoom: keep a stable minimum canvas height so aspect ratio doesn't change
  const effectiveHeight = maxHeight
    ? Math.max(contentHeight, maxHeight)
    : contentHeight;
  const containerStyle = maxHeight
    ? { width: "100%", maxHeight, overflowY: "auto" as const }
    : { width: "100%", height };
  const innerStyle = maxHeight
    ? { height: effectiveHeight, width: "100%" }
    : { width: "100%" };

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <Canvas
          camera={{ position: [0, 0, cameraZ], fov: cameraFov }}
          gl={{ antialias: true, alpha: true }}
        >
          <StageScene
            mode={mode}
            selected={selected}
            library={library}
            onAddFromLibrary={onAddFromLibrary}
            onRemoveSelected={onRemoveSelected}
            rollPulse={rollPulse}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default DiceStage;
