"use client";

import { Suspense, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FlightRig } from "./FlightRig";
import { MilkyWay } from "./MilkyWay";
import { PlanetarySystem } from "./PlanetarySystem";
import { ShootingStars } from "./ShootingStars";
import { StarField } from "./StarField";
import type { FlightInput } from "./types";

export function SpaceFlightScene({ progress, pointer }: FlightInput) {
  const scene = useThree((state) => state.scene);
  const renderer = useThree((state) => state.gl);

  useEffect(() => {
    const previousToneMapping = renderer.toneMapping;
    const previousExposure = renderer.toneMappingExposure;
    const previousColorSpace = renderer.outputColorSpace;
    const previousFog = scene.fog;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene.fog = new THREE.FogExp2("#090203", 0.00135);

    return () => {
      renderer.toneMapping = previousToneMapping;
      renderer.toneMappingExposure = previousExposure;
      renderer.outputColorSpace = previousColorSpace;
      scene.fog = previousFog;
    };
  }, [renderer, scene]);

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
