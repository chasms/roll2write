import "@react-three/fiber"; // ensure R3F types are loaded
import * as React from "react";
import { useMemo } from "react";
import * as THREE from "three";
/* eslint-disable react/no-unknown-property */

// Minimal JSX intrinsic element augmentation to allow react-three-fiber tags
// without introducing broad 'any' usage or separate d.ts files.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      mesh: Record<string, unknown>;
      primitive: Record<string, unknown>;
      meshStandardMaterial: Record<string, unknown>;
      lineSegments: Record<string, unknown>;
      lineBasicMaterial: Record<string, unknown>;
      points: Record<string, unknown>;
      pointsMaterial: Record<string, unknown>;
      meshPhysicalMaterial: Record<string, unknown>;
    }
  }
}

export interface DieAppearanceOverrides {
  roughness?: number; // 0 = mirror, 1 = diffuse
  metalness?: number; // metallic look
  reflectivity?: number; // for physical material (indirect specular)
  transmission?: number; // glass-like translucency (0-1)
  ior?: number; // index of refraction (e.g. 1.1 - 2.3)
  thickness?: number; // how thick for transmission scattering
  attenuationDistance?: number; // for volumetric attenuation
  attenuationColor?: string;
  opacity?: number; // fallback non-physical transparency
  clearcoat?: number; // additional reflective layer
  clearcoatRoughness?: number;
  sheen?: number; // cloth-like sheen
  sheenColor?: string;
  sparkleIntensity?: number; // 0 disables sparkle points
  sparkleCount?: number; // number of sparkle points
  sparkleColor?: string;
}

export interface DieMeshProps {
  sides: number;
  color: string;
  pattern: string;
  angle: number; // degrees
  appearance?: DieAppearanceOverrides;
}

function buildPolygonShape(sides: number, radius = 1.05) {
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function buildPolyhedronGeometry(sides: number): THREE.BufferGeometry | null {
  switch (sides) {
    case 4:
      return new THREE.TetrahedronGeometry(1, 0);
    case 6:
      return new THREE.BoxGeometry(1, 1, 1);
    case 8:
      return new THREE.OctahedronGeometry(1, 0);
    case 12:
      return new THREE.DodecahedronGeometry(1, 0);
    case 20:
      return new THREE.IcosahedronGeometry(1, 0);
    default:
      return null;
  }
}

export const DieMesh: React.FC<DieMeshProps> = ({
  sides,
  color,
  pattern,
  angle,
  appearance,
}) => {
  const geometry = useMemo(() => {
    const poly = buildPolyhedronGeometry(sides);
    let g: THREE.BufferGeometry;
    if (poly) {
      g = poly; // already centered around origin for platonic solids
    } else {
      const shape = buildPolygonShape(Math.max(3, Math.min(sides, 64)));
      g = new THREE.ExtrudeGeometry(shape, {
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelOffset: 0,
        bevelSegments: 2,
        steps: 1,
      });
      g.center();
    }
    // Normalize scale so bounding sphere radius ~ target
    g.computeBoundingSphere();
    const targetRadius = 1.05;
    const sphere = g.boundingSphere;
    if (sphere && sphere.radius > 0) {
      const scale = targetRadius / sphere.radius;
      g.scale(scale, scale, scale);
      g.computeBoundingSphere();
    }
    // Static tilt and deterministic Z rotation for consistent orientation
    const euler = new THREE.Euler(0.6, 0, (angle * Math.PI) / 180);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(euler);
    g.applyMatrix4(m);
    return g;
  }, [sides, angle]);

  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(geometry, 40),
    [geometry]
  );

  function edgeColorFromHex(hex: string): string {
    const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
    const full =
      cleaned.length === 3
        ? cleaned
            .split("")
            .map((c) => c + c)
            .join("")
        : cleaned;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    // Perceived luminance
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    return l < 0.5 ? "#ffffff" : "#111111";
  }
  const edgeColor = edgeColorFromHex(color);

  const texture = useMemo(() => {
    function setSRGB(tex: THREE.Texture) {
      (tex as THREE.Texture & { colorSpace?: unknown }).colorSpace =
        THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    }
    try {
      if (pattern === "stripes") {
        // Create a higher-contrast multi-stripe pattern
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return undefined;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        const light = "#ffffff";
        const dark = "#000000";
        // Diagonal stripes: wide bright, narrow dark accent
        ctx.lineWidth = 22;
        ctx.strokeStyle = light;
        for (let offset = -size; offset < size * 2; offset += 42) {
          ctx.beginPath();
          ctx.moveTo(offset, 0);
          ctx.lineTo(offset + size, size);
          ctx.stroke();
          // dark accent
          ctx.strokeStyle = dark;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(offset + 14, 0);
          ctx.lineTo(offset + size + 14, size);
          ctx.stroke();
          ctx.strokeStyle = light;
          ctx.lineWidth = 22;
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        setSRGB(tex);
        return tex;
      }
      if (pattern === "gradient") {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (!ctx) return undefined;
        // Radial-ish multi-stop gradient (approximate) using concentric squares
        const base = color;
        const mid = "#444444";
        const end = "#000000";
        const stops: [number, string][] = [
          [0, base],
          [0.5, mid],
          [1, end],
        ];
        // Manual interpolation
        for (let y = 0; y < canvas.height; y++) {
          const t = y / (canvas.height - 1);
          // find surrounding stops
          let s0 = stops[0];
          let s1 = stops[stops.length - 1];
          for (let i = 0; i < stops.length - 1; i++) {
            if (t >= stops[i][0] && t <= stops[i + 1][0]) {
              s0 = stops[i];
              s1 = stops[i + 1];
              break;
            }
          }
          const span = s1[0] - s0[0] || 1;
          const localT = (t - s0[0]) / span;
          const c = lerpHex(s0[1], s1[1], localT);
          ctx.fillStyle = c;
          ctx.fillRect(0, y, canvas.width, 1);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setSRGB(tex);
        return tex;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, [color, pattern]);

  // Helper for gradient color interpolation
  function lerpHex(a: string, b: string, t: number): string {
    const ca = parseInt(a.replace("#", ""), 16);
    const cb = parseInt(b.replace("#", ""), 16);
    const ar = (ca >> 16) & 0xff;
    const ag = (ca >> 8) & 0xff;
    const ab = ca & 0xff;
    const br = (cb >> 16) & 0xff;
    const bg = (cb >> 8) & 0xff;
    const bb = cb & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return (
      "#" + [rr, rg, rb].map((n) => n.toString(16).padStart(2, "0")).join("")
    );
  }

  // Sparkle points (static per geometry + color) for simple glitter effect
  const sparkle = useMemo(() => {
    const intensity = appearance?.sparkleIntensity ?? 0;
    if (intensity <= 0) return null;
    const count = Math.min(appearance?.sparkleCount ?? 40, 400);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // random point in sphere radius ~1
      let x = 0;
      let y = 0;
      let z = 0;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
      } while (x * x + y * y + z * z > 1);
      positions[i * 3] = x * 1.0;
      positions[i * 3 + 1] = y * 1.0;
      positions[i * 3 + 2] = z * 1.0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geo };
  }, [appearance?.sparkleIntensity, appearance?.sparkleCount]);

  return (
    <mesh>
      <primitive object={geometry} />
      <meshPhysicalMaterial
        key={pattern + color}
        // If using a pattern map we set the base color to white to preserve texture colors
        color={pattern === "solid" ? color : "#ffffff"}
        map={pattern === "solid" ? undefined : texture}
        roughness={appearance?.roughness ?? 0.55}
        metalness={appearance?.metalness ?? 0.15}
        reflectivity={appearance?.reflectivity ?? 0.5}
        transmission={appearance?.transmission ?? 0}
        ior={appearance?.ior ?? 1.3}
        thickness={appearance?.thickness ?? 0.2}
        attenuationDistance={appearance?.attenuationDistance ?? 0}
        attenuationColor={appearance?.attenuationColor ?? color}
        clearcoat={appearance?.clearcoat ?? 0.1}
        clearcoatRoughness={appearance?.clearcoatRoughness ?? 0.3}
        sheen={appearance?.sheen ?? 0}
        sheenColor={appearance?.sheenColor ?? color}
        transparent={
          (appearance?.opacity ?? 1) < 1 || (appearance?.transmission ?? 0) > 0
        }
        opacity={appearance?.opacity ?? 1}
      />
      <lineSegments>
        <primitive object={edgesGeometry} />
        <lineBasicMaterial color={edgeColor} linewidth={1} />
      </lineSegments>
      {sparkle?.geo && (
        <points>
          <primitive object={sparkle.geo} />
          <pointsMaterial
            size={0.035}
            sizeAttenuation={true}
            color={appearance?.sparkleColor ?? "#ffffff"}
            transparent={true}
            opacity={(appearance?.sparkleIntensity ?? 0) * 0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </mesh>
  );
};
