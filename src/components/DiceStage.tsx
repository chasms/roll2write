import { useCursor } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import type { DieDefinition } from "../domain/types";
import { LibraryDie } from "./LibraryDie";
import { SelectedDie } from "./SelectedDie";
import {
  applyDamping,
  calculateAngularVelocity,
  calculateContentHeight,
  calculateDampingFactor,
  calculateEffectiveHeight,
  calculateGridRows,
  calculateRotationFromDrag,
  clampRotation,
  deriveCameraZoom,
  generateRandomSpinSpeed,
  gridPositions,
  interpolateHeight,
  shouldStopInertia,
} from "./DiceStage.utils";

export interface DiceStageProps {
  mode: "selected" | "library";
  selected: { id: string; die: DieDefinition }[];
  library: DieDefinition[];
  onAddFromLibrary?: (dieId: string) => void;
  onRemoveSelected?: (selectionId: string) => void;
  onEditLibraryDie?: (dieId: string) => void;
  height?: number; // fixed height (no scroll) if provided and maxHeight is undefined
  maxHeight?: number; // scroll container max height; Canvas grows to fit content and scrolls if needed
  rowPx?: number; // approximate pixels per grid row when auto-sizing canvas within scroll container
  cameraZ?: number; // camera z position (orthographic depth positioning only)
  /** Optional explicit orthographic zoom override. If not provided, derived from rowPx & cell size for stable apparent scale. */
  cameraZoom?: number;
  rollPulse?: number; // when changed, briefly spin selected dice
  /** If provided, only the matching selection id spins for this pulse; null spins all; undefined uses default (all). */
  rollPulseTargetId?: string | null;
}

function StageScene({
  mode,
  selected,
  library,
  onAddFromLibrary,
  onRemoveSelected,
  onEditLibraryDie,
  rollPulse,
  rollPulseTargetId,
}: Omit<
  DiceStageProps,
  "height" | "maxHeight" | "rowPx" | "cameraZ" | "cameraZoom"
>) {
  // Layout inside Canvas (centered grid per mode)
  // Constant column count so dice size remains stable.
  const selectedCols = 5;
  const libraryCols = 5; // constant column count for library
  const cellSelected = 2.4; // keep consistent cell size between stages
  const cellLibrary = 2.4;
  // Use viewport height (world units) to TOP-anchor the first row so adding rows doesn't push content downward.
  const viewportH = useThree((s) => s.viewport.height);
  const selectedOriginY = viewportH / 2 - cellSelected / 2;
  const libraryOriginY = viewportH / 2 - cellLibrary / 2;
  // Fixed spacing; no compression to avoid snapping when transitioning rows
  const selectedPos = useMemo(
    () =>
      gridPositions(
        selected.length,
        selectedCols,
        cellSelected,
        0,
        selectedOriginY
      ),
    [selected.length, selectedOriginY]
  );
  const libraryPos = useMemo(
    () =>
      gridPositions(
        library.length,
        libraryCols,
        cellLibrary,
        0,
        libraryOriginY
      ),
    [library.length, libraryOriginY]
  );

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  useCursor(!!hoveredId);

  // Guard against duplicate onClick invocations from multiple child intersections
  const clickGuardRef = React.useRef(false);

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
    lastTimestamp: number; // milliseconds
    lastVelocityX: number; // last computed angular velocity x (rad/s)
    lastVelocityY: number; // last computed angular velocity y (rad/s)
  } | null>(null);
  // Single ref map for this canvas' dice
  const groupRefs = React.useRef<Map<string, THREE.Group>>(new Map());
  // Inertial angular velocities (radians per second) for this canvas
  const inertia = React.useRef<
    Map<string, { velocityX: number; velocityY: number }>
  >(new Map());
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
      lastTimestamp: event.timeStamp,
      lastVelocityX: 0,
      lastVelocityY: 0,
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
    const deltaX = event.clientX - draggable.startX;
    const deltaY = event.clientY - draggable.startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) draggable.moved = true;
    const sensitivity = 0.01;
    const { rotationX, rotationY } = calculateRotationFromDrag(
      deltaX,
      deltaY,
      draggable.startRotX,
      draggable.startRotY,
      sensitivity
    );
    group.rotation.y = rotationY;
    // clamp x tilt a bit so it doesn't flip wildly
    group.rotation.x = clampRotation(rotationX, -1.2, 1.2);
    // Update instantaneous angular velocity for inertia
    const deltaTimeMs = event.timeStamp - draggable.lastTimestamp;
    const velocityX = calculateAngularVelocity(
      group.rotation.x,
      draggable.lastAngleX,
      deltaTimeMs
    );
    const velocityY = calculateAngularVelocity(
      group.rotation.y,
      draggable.lastAngleY,
      deltaTimeMs
    );
    draggable.lastAngleX = group.rotation.x;
    draggable.lastAngleY = group.rotation.y;
    draggable.lastTimestamp = event.timeStamp;
    draggable.lastVelocityX = velocityX;
    draggable.lastVelocityY = velocityY;
  };
  const endDrag = (event: ThreeEvent<PointerEvent> | PointerEvent) => {
    const draggable = draggingRef.current;
    if (!draggable) return;
    const group = groupRefs.current.get(draggable.id);
    // Commit inertia regardless of movement threshold (for smooth continuation)
    if (group) {
      // If there were no move events (click-only), estimate velocity from lastAngle deltas
      let velocityX = draggable.lastVelocityX;
      let velocityY = draggable.lastVelocityY;
      if (!draggable.moved) {
        const deltaTimeMs =
          (event as PointerEvent).timeStamp - draggable.lastTimestamp;
        // Using difference between current rotation and recorded lastAngle (likely zero) -> velocity near 0 (no inertia)
        velocityX = calculateAngularVelocity(
          group.rotation.x,
          draggable.lastAngleX,
          deltaTimeMs
        );
        velocityY = calculateAngularVelocity(
          group.rotation.y,
          draggable.lastAngleY,
          deltaTimeMs
        );
      }
      if (!shouldStopInertia(velocityX, velocityY, 0.0001)) {
        inertia.current.set(draggable.id, { velocityX, velocityY });
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
  const spinSpeedsRef = React.useRef<
    Map<string, { spinSpeedX: number; spinSpeedY: number }>
  >(new Map());
  const selectedRef = React.useRef(selected);
  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  React.useEffect(() => {
    if (typeof rollPulse !== "number") return;
    // When rollPulse changes, compute targets
    const list = selectedRef.current;
    if (list.length === 0) return;
    spinUntilRef.current = performance.now() + 900;
    const speeds = new Map<
      string,
      { spinSpeedX: number; spinSpeedY: number }
    >();
    const assign = (id: string) => {
      const spinSpeed = generateRandomSpinSpeed();
      speeds.set(id, spinSpeed);
    };
    if (rollPulseTargetId === null) {
      // Pulse all selected dice
      for (const sel of list) assign(sel.id);
    } else if (rollPulseTargetId) {
      // Pulse only the targeted selection id if present
      if (list.some((s) => s.id === rollPulseTargetId))
        assign(rollPulseTargetId);
    } else {
      // Default: pulse all
      for (const sel of list) assign(sel.id);
    }
    spinSpeedsRef.current = speeds;
  }, [rollPulse, rollPulseTargetId]);

  useFrame((_, delta) => {
    const now = performance.now();
    if (now < spinUntilRef.current && mode === "selected") {
      groupRefs.current.forEach((group, id) => {
        const spinSpeed = spinSpeedsRef.current.get(id);
        const spinSpeedY = spinSpeed?.spinSpeedY ?? 5.2;
        const spinSpeedX = spinSpeed?.spinSpeedX ?? 0;
        group.rotation.y += delta * spinSpeedY;
        group.rotation.x = clampRotation(
          group.rotation.x + delta * spinSpeedX,
          -1.2,
          1.2
        );
      });
    }
    // Apply inertia with exponential damping
    const dampFactor = calculateDampingFactor(delta);
    inertia.current.forEach((velocity, id) => {
      const group = groupRefs.current.get(id);
      if (!group) {
        inertia.current.delete(id);
        return;
      }
      group.rotation.x = clampRotation(
        group.rotation.x + velocity.velocityX * delta,
        -1.2,
        1.2
      );
      group.rotation.y += velocity.velocityY * delta;
      velocity.velocityX = applyDamping(velocity.velocityX, dampFactor);
      velocity.velocityY = applyDamping(velocity.velocityY, dampFactor);
      if (shouldStopInertia(velocity.velocityX, velocity.velocityY, 0.01)) {
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

      {mode === "selected"
        ? selected.map((sel, i) => (
            <SelectedDie
              key={sel.id}
              selectionId={sel.id}
              die={sel.die}
              position={selectedPos[i] ?? [0, 0, 0]}
              clickGuardRef={clickGuardRef}
              groupRefs={groupRefs}
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
              onRemoveSelected={onRemoveSelected}
            />
          ))
        : library.map((die, i) => (
            <LibraryDie
              key={die.id}
              die={die}
              position={libraryPos[i] ?? [0, 0, 0]}
              isHovered={hoveredId === die.id}
              clickGuardRef={clickGuardRef}
              groupRefs={groupRefs}
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
              onAddFromLibrary={onAddFromLibrary}
              onEditLibraryDie={onEditLibraryDie}
            />
          ))}
    </>
  );
}

export const DiceStage: React.FC<DiceStageProps> = ({
  mode,
  selected,
  library,
  onAddFromLibrary,
  onRemoveSelected,
  onEditLibraryDie,
  height = 420,
  maxHeight,
  rowPx = 120,
  cameraZ = 12,
  cameraZoom,
  rollPulse,
  rollPulseTargetId,
}) => {
  // compute grid rows to size the canvas when using a scroll container
  const selectedCols = 5; // keep constant so Canvas height & camera stable
  const libraryCols = 5;
  const itemCount = mode === "selected" ? selected.length : library.length;
  const cols = mode === "selected" ? selectedCols : libraryCols;
  const rows = calculateGridRows(itemCount, cols);
  const baseContentHeight = calculateContentHeight(rows, rowPx);

  // Smooth 1->2 row expansion (Option D): animate when transitioning from 1 to 2 rows only
  const prevRowsRef = React.useRef(rows);
  const animRef = React.useRef<{
    from: number;
    to: number;
    start: number;
    duration: number;
  } | null>(null);
  const [animTick, setAnimTick] = React.useState(0); // force re-render during animation

  // Kick off animation when row count increases from 1 to 2
  if (prevRowsRef.current !== rows) {
    if (prevRowsRef.current === 1 && rows === 2) {
      animRef.current = {
        from: rowPx, // previous single-row height
        to: baseContentHeight,
        start: performance.now(),
        duration: 200, // ms
      };
    } else {
      // For all other transitions (e.g., 2->3) just snap (can extend later if desired)
      animRef.current = null;
    }
    prevRowsRef.current = rows;
  }

  // RAF loop for animation
  React.useEffect(() => {
    let raf: number;
    const step = () => {
      const anim = animRef.current;
      if (!anim) return; // no animation
      const now = performance.now();
      const t = Math.min(1, (now - anim.start) / anim.duration);
      // easeOutCubic progression value computed below where needed
      if (t >= 1) {
        animRef.current = null;
        setAnimTick((v) => v + 1);
        return;
      } else {
        setAnimTick((v) => v + 1);
        raf = requestAnimationFrame(step);
      }
    };
    if (animRef.current) {
      raf = requestAnimationFrame(step);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [animTick, rows]);

  // Compute animated height (only distinct during the 1->2 row animation)
  let contentHeight = baseContentHeight;
  const activeAnim = animRef.current;
  if (activeAnim) {
    const now = performance.now();
    const progress = Math.min(
      1,
      (now - activeAnim.start) / activeAnim.duration
    );
    contentHeight = interpolateHeight(activeAnim.from, activeAnim.to, progress);
  }
  // Only grow container height up to content; allow scrolling only past maxHeight
  const effectiveHeight = calculateEffectiveHeight(contentHeight, maxHeight);
  const containerStyle: React.CSSProperties = maxHeight
    ? {
        width: "100%",
        maxHeight,
        overflowY: contentHeight > maxHeight ? "auto" : "hidden",
      }
    : { width: "100%", height };
  const innerStyle = maxHeight
    ? {
        height: effectiveHeight,
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "stretch",
        transition: animRef.current ? undefined : "height 0.05s linear",
      }
    : { width: "100%" };

  // Derive orthographic zoom if not explicitly provided. This ties world cell size (2.4) to desired pixel row height.
  const derivedZoom = cameraZoom ?? deriveCameraZoom(rowPx, 2.4);

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <Canvas
          orthographic
          camera={{
            position: [0, 0, cameraZ],
            zoom: derivedZoom,
            near: -100,
            far: 100,
          }}
          gl={{ antialias: true, alpha: true }}
        >
          <StageScene
            mode={mode}
            selected={selected}
            library={library}
            onAddFromLibrary={onAddFromLibrary}
            onRemoveSelected={onRemoveSelected}
            onEditLibraryDie={onEditLibraryDie}
            rollPulse={rollPulse}
            rollPulseTargetId={rollPulseTargetId}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default DiceStage;
