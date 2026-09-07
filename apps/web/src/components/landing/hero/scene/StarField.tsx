"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRandom } from "./spaceMath";

export function StarField() {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const count = 6200;
    const random = createSeededRandom(4182);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const orange = new THREE.Color("#ff9d43");
    const red = new THREE.Color("#ff4933");
    const green = new THREE.Color("#7dff72");
    const white = new THREE.Color("#fff1ca");
    const color = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 11 + Math.pow(random(), 0.48) * 115;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.62;
      positions[index * 3 + 2] = 95 - random() * 475;

      const palette = random();
      if (palette < 0.24) color.copy(orange);
      else if (palette < 0.42) color.copy(red);
      else if (palette < 0.58) color.copy(green);
      else color.copy(white);
      color.multiplyScalar(0.55 + random() * 0.7);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const points = new THREE.BufferGeometry();
    points.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    points.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return points;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state) => {
    if (group.current) group.current.rotation.z = state.clock.elapsedTime * 0.0025;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          vertexColors
          size={0.28}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
