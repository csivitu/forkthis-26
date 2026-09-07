"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRandom } from "./spaceMath";

export function MilkyWay() {
  const galaxy = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const count = 15000;
    const random = createSeededRandom(9917);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const core = new THREE.Color("#fff1b8");
    const middle = new THREE.Color("#ff6b3a");
    const edge = new THREE.Color("#70e875");
    const color = new THREE.Color();
    const galaxyRadius = 285;

    for (let index = 0; index < count; index += 1) {
      const radius = Math.pow(random(), 0.54) * galaxyRadius;
      const arm = (index % 5) * ((Math.PI * 2) / 5);
      const angle = arm + radius * 0.026 + (random() - 0.5) * 1.05;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.34;
      positions[index * 3 + 2] = (random() - 0.5) * (4 + radius * 0.065);

      const mix = radius / galaxyRadius;
      if (mix < 0.48) color.copy(core).lerp(middle, mix / 0.48);
      else color.copy(middle).lerp(edge, (mix - 0.48) / 0.52);
      color.multiplyScalar(0.48 + random() * 0.62);
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
  useFrame((_, delta) => {
    if (galaxy.current) galaxy.current.rotation.z += delta * 0.0018;
  });

  return (
    <group ref={galaxy} position={[0, 22, -720]} rotation={[0.24, 0.08, -0.18]}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          vertexColors
          size={0.92}
          sizeAttenuation
          transparent
          opacity={0.76}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <mesh scale={[2.4, 0.72, 0.5]}>
        <sphereGeometry args={[10, 40, 40]} />
        <meshBasicMaterial
          color="#ffc865"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
