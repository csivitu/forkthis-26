"use client";

import { Suspense } from "react";
import { FlightRig } from "./FlightRig";
import { MilkyWay } from "./MilkyWay";
import { PlanetarySystem } from "./PlanetarySystem";
import { ShootingStars } from "./ShootingStars";
import { StarField } from "./StarField";
import type { FlightInput } from "./types";

export function SpaceFlightScene({ progress, pointer }: FlightInput) {

  return (
    <group>
      <color attach="background" args={["#070103"]} />
      <ambientLight color="#ff8a4c" intensity={0.42} />
      <directionalLight color="#ffb052" intensity={2.4} position={[18, 26, 24]} />
      <directionalLight color="#68ff72" intensity={0.7} position={[-20, -8, -80]} />
      <StarField />
      <PlanetarySystem />
      <ShootingStars />
      <MilkyWay />
      <Suspense fallback={null}>
        <FlightRig progress={progress} pointer={pointer} />
      </Suspense>
    </group>
  );
}
