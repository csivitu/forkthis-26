"use client";

import { Suspense } from "react";
import { AsteroidField } from "./AsteroidField";
import { FlightRig } from "./FlightRig";
import { OpeningLogo } from "./OpeningLogo";
import { StarField } from "./StarField";
import type { FlightState } from "./types";

export function SpaceFlightScene({ progress, pointer, paused }: FlightState) {

  return (
    <group>
      <color attach="background" args={["#070103"]} />
      <ambientLight color="#ff8a4c" intensity={0.42} />
      <directionalLight color="#ffb052" intensity={2.4} position={[18, 26, 24]} />
      <directionalLight color="#68ff72" intensity={0.7} position={[-20, -8, -80]} />
      <StarField />
      <AsteroidField />
      <Suspense fallback={null}>
        <OpeningLogo />
      </Suspense>
      <Suspense fallback={null}>
        <FlightRig progress={progress} pointer={pointer} paused={paused} />
      </Suspense>
    </group>
  );
}
