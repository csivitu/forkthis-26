"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SpaceFlightScene } from "./scene/SpaceFlightScene";
import type { FlightInput } from "./scene/types";

const SCENE_FOG = new THREE.FogExp2("#090203", 0.00135);

export default function HeroCanvas({ progress, pointer }: FlightInput) {
  return (
    <Canvas
      camera={{ position: [0, 6, 65], fov: 75, near: 0.01, far: 1000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      scene={{ fog: SCENE_FOG }}
      dpr={[1, 1.5]}
    >
      <SpaceFlightScene progress={progress} pointer={pointer} />
    </Canvas>
  );
}
