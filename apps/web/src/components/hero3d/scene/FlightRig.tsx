"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CockpitModel } from "./CockpitModel";
import { SPACE_PATH } from "./spaceMath";
import type { FlightInput } from "./types";

const CAMERA_POINT = new THREE.Vector3();
const LOOK_POINT = new THREE.Vector3();
const FORWARD = new THREE.Vector3();
const COCKPIT_QUATERNION = new THREE.Quaternion();

export function FlightRig({ progress, pointer }: FlightInput) {
  const camera = useThree((state) => state.camera);
  const rig = useRef<THREE.Group>(null);
  const smoothedProgress = useRef(0);
  const smoothedPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!rig.current) return;

    const frameDelta = Math.min(delta, 0.1);
    smoothedProgress.current = THREE.MathUtils.damp(
      smoothedProgress.current,
      progress,
      2,
      frameDelta,
    );
    smoothedPointer.current.x = THREE.MathUtils.damp(
      smoothedPointer.current.x,
      pointer.x,
      3.2,
      frameDelta,
    );
    smoothedPointer.current.y = THREE.MathUtils.damp(
      smoothedPointer.current.y,
      pointer.y,
      3.2,
      frameDelta,
    );

    const flightProgress = smoothedProgress.current;
    const lookProgress = Math.min(1, flightProgress + 0.022);
    SPACE_PATH.getPointAt(flightProgress, CAMERA_POINT);
    SPACE_PATH.getPointAt(lookProgress, LOOK_POINT);
    if (lookProgress === 1) LOOK_POINT.z -= 28;

    const idleTime = state.clock.elapsedTime;
    CAMERA_POINT.y += Math.sin(idleTime * 0.32) * 0.18;
    CAMERA_POINT.x += Math.sin(idleTime * 0.21) * 0.12;
    camera.position.copy(CAMERA_POINT);
    camera.lookAt(LOOK_POINT);
    camera.rotation.x += smoothedPointer.current.y * 0.018;
    camera.rotation.y -= smoothedPointer.current.x * 0.018;
    camera.rotation.z +=
      Math.sin(flightProgress * Math.PI * 5) * 0.012 -
      smoothedPointer.current.x * 0.008;
    camera.updateMatrixWorld();

    camera.getWorldDirection(FORWARD);
    const cockpitOffset = 1.55 - 0.07 * flightProgress;
    rig.current.position.copy(camera.position).addScaledVector(FORWARD, cockpitOffset);
    COCKPIT_QUATERNION.copy(camera.quaternion);
    rig.current.quaternion.slerp(
      COCKPIT_QUATERNION,
      1 - Math.exp(-2.4 * frameDelta),
    );
  }, -1);

  return (
    <group ref={rig}>
      <CockpitModel />
    </group>
  );
}
