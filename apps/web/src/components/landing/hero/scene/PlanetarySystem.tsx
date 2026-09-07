"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetConfig } from "./types";

const PLANETS: PlanetConfig[] = [
  {
    position: [-31, 10, 22],
    radius: 15,
    color: "#bc351e",
    emissive: "#5d0903",
    atmosphere: "#ff6b28",
    rotationSpeed: 0.06,
  },
  {
    position: [31, -9, -92],
    radius: 11,
    color: "#e06a22",
    emissive: "#541307",
    atmosphere: "#ffb13b",
    rotationSpeed: -0.055,
    ring: {
      inner: 14,
      outer: 21,
      color: "#ff7c2e",
      tilt: [1.16, 0.18, -0.22],
    },
  },
  {
    position: [-31, 11, -205],
    radius: 13,
    color: "#377a36",
    emissive: "#123b1e",
    atmosphere: "#72ff72",
    rotationSpeed: 0.045,
  },
  {
    position: [-5, 22, -258],
    radius: 3.1,
    color: "#d84a25",
    emissive: "#541007",
    atmosphere: "#ff7941",
    rotationSpeed: 0.085,
  },
];

function Planet({
  position,
  radius,
  color,
  emissive,
  atmosphere,
  rotationSpeed,
  ring,
}: PlanetConfig) {
  const planet = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (surface.current) surface.current.rotation.y += delta * rotationSpeed;
    if (!planet.current) return;
    planet.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.24 + position[2] * 0.1) * 0.55;
    planet.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.16 + position[0] * 0.08) * 0.012;
  });

  return (
    <group ref={planet} position={position}>
      <mesh ref={surface} rotation={[0.18, 0, -0.08]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.72}
          roughness={0.86}
          metalness={0.04}
        />
      </mesh>
      <mesh scale={1.002} rotation={[0.18, 0, -0.08]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color={atmosphere}
          wireframe
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.075, 48, 48]} />
        <meshBasicMaterial
          color={atmosphere}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {ring ? (
        <mesh rotation={ring.tilt}>
          <ringGeometry args={[ring.inner, ring.outer, 128]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function StellarBody() {
  const corona = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!corona.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.035;
    corona.current.scale.setScalar(pulse);
  });

  return (
    <group position={[43, 18, -338]}>
      <pointLight color="#ff6b24" intensity={980} distance={145} decay={1.55} />
      <mesh>
        <sphereGeometry args={[12, 64, 64]} />
        <meshBasicMaterial color="#ff8b2b" toneMapped={false} />
      </mesh>
      <mesh ref={corona}>
        <sphereGeometry args={[14.5, 48, 48]} />
        <meshBasicMaterial
          color="#ff3b1f"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.65}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#ffb133"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function PlanetarySystem() {
  return (
    <>
      {PLANETS.map((planet) => (
        <Planet key={planet.position.join(":")} {...planet} />
      ))}
      <StellarBody />
    </>
  );
}
