"use client";

import { Canvas } from "@react-three/fiber";
import { SpaceFlightScene } from "./scene/SpaceFlightScene";
import type { FlightInput } from "./scene/types";

export default function HeroCanvas({ progress, pointer }: FlightInput) {
  return (
    <Canvas
      camera={{ position: [0, 6, 65], fov: 75, near: 0.01, far: 1000 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <SpaceFlightScene progress={progress} pointer={pointer} />
    </Canvas>
  );
}
