"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CockpitModel } from "./CockpitModel";
import { SPACE_PATH } from "./spaceMath";
import type { FlightState } from "./types";

const CAMERA_POINT = new THREE.Vector3();
const LOOK_POINT = new THREE.Vector3();
const FORWARD = new THREE.Vector3();
const COCKPIT_QUATERNION = new THREE.Quaternion();

function Headlights() {
  const leftLight = useRef<THREE.SpotLight>(null);
  const rightLight = useRef<THREE.SpotLight>(null);
  const leftTarget = useRef<THREE.Object3D>(null);
  const rightTarget = useRef<THREE.Object3D>(null);

  useLayoutEffect(() => {
    if (leftLight.current && leftTarget.current) leftLight.current.target = leftTarget.current;
    if (rightLight.current && rightTarget.current) rightLight.current.target = rightTarget.current;
  }, []);

  return (
    <group>
      <spotLight
        ref={leftLight}
        color="#ffffff"
        intensity={9500}
        distance={150}
        angle={0.52}
        penumbra={0.64}
        decay={2}
        position={[-0.72, 0.12, -0.2]}
      />
      <spotLight
        ref={rightLight}
        color="#ffffff"
        intensity={9500}
        distance={150}
        angle={0.52}
        penumbra={0.64}
        decay={2}
        position={[0.72, 0.12, -0.2]}
      />
      <object3D ref={leftTarget} position={[-7, -0.5, -70]} />
      <object3D ref={rightTarget} position={[7, -0.5, -70]} />
    </group>
  );
}

export function FlightRig({ progress, pointer, paused }: FlightState) {
  const rig = useRef<THREE.Group>(null);
  const smoothedProgress = useRef(0);
  const smoothedPointer = useRef({ x: 0, y: 0 });
  const idleElapsed = useRef(0);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const camera = state.camera;

    const frameDelta = Math.min(delta, 0.1);
    if (paused) {
      smoothedProgress.current = progress;
    } else {
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
      idleElapsed.current += frameDelta;
    }

    const flightProgress = smoothedProgress.current;
    const lookProgress = Math.min(1, flightProgress + 0.022);
    SPACE_PATH.getPointAt(flightProgress, CAMERA_POINT);
    SPACE_PATH.getPointAt(lookProgress, LOOK_POINT);
    if (lookProgress === 1) LOOK_POINT.z -= 28;

    const idleTime = idleElapsed.current;
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
    if (paused) {
      rig.current.quaternion.copy(COCKPIT_QUATERNION);
    } else {
      rig.current.quaternion.slerp(
        COCKPIT_QUATERNION,
        1 - Math.exp(-2.4 * frameDelta),
      );
    }
  }, -1);

  return (
    <group ref={rig}>
      <CockpitModel />
      <Headlights />
    </group>
  );
}
