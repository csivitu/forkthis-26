"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRandom } from "./spaceMath";

export function ShootingStars() {
  const stars = useRef<Array<THREE.Group | null>>([]);
  const configs = useMemo(() => {
    const random = createSeededRandom(6203);
    return Array.from({ length: 6 }, (_, index) => ({
      startX: -72 - random() * 28,
      startY: 34 + random() * 28,
      travelX: 155 + random() * 48,
      travelY: 58 + random() * 24,
      z: -30 - random() * 560,
      phase: random(),
      speed: 0.04 + random() * 0.026,
      scale: 0.9 + random() * 0.62,
      color: ["#fff0b0", "#ff7034", "#72ff78"][index % 3],
    }));
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    configs.forEach((config, index) => {
      const star = stars.current[index];
      if (!star) return;
      const cycle = (elapsed * config.speed + config.phase) % 1;
      const visibleDuration = 0.68;
      star.visible = cycle < visibleDuration;
      if (!star.visible) return;
      const travel = cycle / visibleDuration;
      star.position.set(
        config.startX + config.travelX * travel,
        config.startY - config.travelY * travel,
        config.z,
      );
      const pulse = Math.sin(travel * Math.PI);
      star.scale.setScalar(config.scale * (0.55 + pulse * 0.65));
    });
  });

  return (
    <group>
      {configs.map((config, index) => (
        <group
          key={`${config.z}-${index}`}
          ref={(node) => {
            stars.current[index] = node;
          }}
          rotation={[0, 0, -0.44]}
        >
          <mesh>
            <sphereGeometry args={[0.56, 16, 16]} />
            <meshBasicMaterial color={config.color} toneMapped={false} />
          </mesh>
          <mesh position={[-7.5, 0, 0]}>
            <planeGeometry args={[15, 0.28]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.56}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
