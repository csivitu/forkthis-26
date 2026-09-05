"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRandom, SPACE_PATH } from "./spaceMath";

const BELT_ROCK_COUNT = 32;
const BELT_SHARD_COUNT = 44;
const INDIVIDUAL_COUNT = 10;
const BELT_CENTERS = [-92, -220];
const ROCK_COLORS = ["#4f3528", "#624332", "#714a34", "#80543a", "#936345", "#a17250"];
const SHARD_COLORS = ["#52372b", "#674634", "#76503a", "#8a5d42", "#9b6d50"];
const INDIVIDUAL_COLORS = ["#432d24", "#594031", "#6b4936", "#7d5137", "#8f5d3e", "#a06c49"];

type Debris = {
  centerX: number;
  centerY: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitYScale: number;
  radialWobble: number;
  wobbleSpeed: number;
  wobblePhase: number;
  z: number;
  zWobble: number;
  rotation: [number, number, number];
  spin: [number, number, number];
  scale: [number, number, number];
  color: string;
};

function getPathCenterAtZ(z: number, pathPoint: THREE.Vector3) {
  let start = 0;
  let end = 1;

  for (let step = 0; step < 14; step += 1) {
    const midpoint = (start + end) * 0.5;
    SPACE_PATH.getPoint(midpoint, pathPoint);
    if (pathPoint.z > z) start = midpoint;
    else end = midpoint;
  }

  SPACE_PATH.getPoint((start + end) * 0.5, pathPoint);
  return { x: pathPoint.x, y: pathPoint.y };
}

function createBeltDebris(count: number, seed: number, shards: boolean): Debris[] {
  const random = createSeededRandom(seed);
  const pathPoint = new THREE.Vector3();
  const innerRadius = shards ? 14 : 18;
  const spread = shards ? 18 : 20;

  return Array.from({ length: count }, (_, index) => {
    const beltCenter = BELT_CENTERS[index % BELT_CENTERS.length];
    const z = beltCenter + (random() - 0.5) * (shards ? 38 : 48);
    const center = getPathCenterAtZ(z, pathPoint);
    const orbitRadius = innerRadius + Math.pow(random(), 0.75) * spread;
    const baseScale = shards ? 0.18 + random() * 0.5 : 0.8 + random() * 2.8;
    const colors = shards ? SHARD_COLORS : ROCK_COLORS;

    return {
      centerX: center.x,
      centerY: center.y,
      orbitAngle: random() * Math.PI * 2,
      orbitRadius,
      orbitSpeed:
        (shards ? 0.12 : 0.09) *
        Math.pow(innerRadius / orbitRadius, 1.5) *
        (0.84 + random() * 0.32),
      orbitYScale: 0.8 + random() * 0.15,
      radialWobble: shards ? 0.45 : 0.8,
      wobbleSpeed: 0.16 + random() * 0.12,
      wobblePhase: random() * Math.PI * 2,
      z,
      zWobble: shards ? 0.55 : 0.9,
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
      spin: [
        (random() - 0.5) * 0.3,
        (random() - 0.5) * 0.3,
        (random() - 0.5) * 0.3,
      ],
      scale: shards
        ? [baseScale * (0.42 + random() * 0.4), baseScale * (1.25 + random() * 1.35), baseScale]
        : [baseScale * (0.76 + random() * 0.42), baseScale, baseScale * (0.68 + random() * 0.5)],
      color: colors[Math.floor(random() * colors.length)],
    };
  });
}

function createIndividualDebris(count: number, seed: number): Debris[] {
  const random = createSeededRandom(seed);
  const pathPoint = new THREE.Vector3();

  return Array.from({ length: count }, () => {
    const z = -28 - random() * 305;
    const center = getPathCenterAtZ(z, pathPoint);
    const orbitRadius = 20 + random() * 30;
    const baseScale = 1.6 + random() * 3.4;

    return {
      centerX: center.x,
      centerY: center.y,
      orbitAngle: random() * Math.PI * 2,
      orbitRadius,
      orbitSpeed: 0.006 + random() * 0.012,
      orbitYScale: 0.84 + random() * 0.13,
      radialWobble: 1.2 + random() * 1.2,
      wobbleSpeed: 0.055 + random() * 0.04,
      wobblePhase: random() * Math.PI * 2,
      z,
      zWobble: 1.4 + random() * 1.1,
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
      spin: [
        (random() - 0.5) * 0.14,
        (random() - 0.5) * 0.14,
        (random() - 0.5) * 0.14,
      ],
      scale: [
        baseScale * (0.72 + random() * 0.5),
        baseScale,
        baseScale * (0.64 + random() * 0.58),
      ],
      color: INDIVIDUAL_COLORS[Math.floor(random() * INDIVIDUAL_COLORS.length)],
    };
  });
}

function createRockGeometry(seed: number, detail: number) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const primaryNoise =
      Math.sin(x * 4.7 + seed * 0.013) *
      Math.sin(y * 5.3 - seed * 0.009) *
      Math.sin(z * 4.1 + seed * 0.017);
    const secondaryNoise =
      Math.sin((x + y) * 6.2 + seed * 0.021) *
      Math.cos((y - z) * 5.6 - seed * 0.015);
    const deformation = 0.78 + primaryNoise * 0.26 + secondaryNoise * 0.14;
    positions.setXYZ(index, x * deformation, y * deformation, z * deformation);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function updateInstances(
  mesh: THREE.InstancedMesh,
  debris: Debris[],
  elapsed: number,
  transform: THREE.Object3D,
) {
  debris.forEach((piece, index) => {
    const wobble = Math.sin(elapsed * piece.wobbleSpeed + piece.wobblePhase);
    const radius = piece.orbitRadius + wobble * piece.radialWobble;
    const angle = piece.orbitAngle + elapsed * piece.orbitSpeed;
    transform.position.set(
      piece.centerX + Math.cos(angle) * radius,
      piece.centerY + Math.sin(angle) * radius * piece.orbitYScale,
      piece.z + wobble * piece.zWobble,
    );
    transform.rotation.set(
      piece.rotation[0] + elapsed * piece.spin[0],
      piece.rotation[1] + elapsed * piece.spin[1],
      piece.rotation[2] + elapsed * piece.spin[2],
    );
    transform.scale.set(...piece.scale);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
}

function applyColors(mesh: THREE.InstancedMesh, debris: Debris[]) {
  const color = new THREE.Color();
  debris.forEach((piece, index) => mesh.setColorAt(index, color.set(piece.color)));
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

export function AsteroidField() {
  const beltRocks = useRef<THREE.InstancedMesh>(null);
  const beltShards = useRef<THREE.InstancedMesh>(null);
  const individuals = useRef<THREE.InstancedMesh>(null);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const beltRockGeometry = useMemo(() => createRockGeometry(9127, 1), []);
  const shardGeometry = useMemo(() => createRockGeometry(4319, 0), []);
  const individualGeometry = useMemo(() => createRockGeometry(6779, 2), []);
  const beltRockDebris = useMemo(() => createBeltDebris(BELT_ROCK_COUNT, 4073, false), []);
  const beltShardDebris = useMemo(() => createBeltDebris(BELT_SHARD_COUNT, 7319, true), []);
  const individualDebris = useMemo(() => createIndividualDebris(INDIVIDUAL_COUNT, 1123), []);

  useLayoutEffect(() => {
    const groups: Array<[THREE.InstancedMesh | null, Debris[]]> = [
      [beltRocks.current, beltRockDebris],
      [beltShards.current, beltShardDebris],
      [individuals.current, individualDebris],
    ];

    groups.forEach(([mesh, debris]) => {
      if (!mesh) return;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      applyColors(mesh, debris);
      updateInstances(mesh, debris, 0, transform);
    });
  }, [beltRockDebris, beltShardDebris, individualDebris, transform]);

  useEffect(
    () => () => {
      beltRockGeometry.dispose();
      shardGeometry.dispose();
      individualGeometry.dispose();
    },
    [beltRockGeometry, individualGeometry, shardGeometry],
  );

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (beltRocks.current) updateInstances(beltRocks.current, beltRockDebris, elapsed, transform);
    if (beltShards.current) updateInstances(beltShards.current, beltShardDebris, elapsed, transform);
    if (individuals.current) updateInstances(individuals.current, individualDebris, elapsed, transform);
  });

  return (
    <group>
      <hemisphereLight color="#ddd5ca" groundColor="#171411" intensity={0.62} />
      <instancedMesh
        ref={beltRocks}
        args={[beltRockGeometry, undefined, BELT_ROCK_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          roughness={0.96}
          metalness={0.03}
          emissive="#28170f"
          emissiveIntensity={0.5}
          flatShading
          vertexColors
        />
      </instancedMesh>
      <instancedMesh
        ref={beltShards}
        args={[shardGeometry, undefined, BELT_SHARD_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          roughness={0.94}
          metalness={0.04}
          emissive="#24140e"
          emissiveIntensity={0.46}
          flatShading
          vertexColors
        />
      </instancedMesh>
      <instancedMesh
        ref={individuals}
        args={[individualGeometry, undefined, INDIVIDUAL_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          roughness={0.97}
          metalness={0.025}
          emissive="#2d1a11"
          emissiveIntensity={0.54}
          flatShading
          vertexColors
        />
      </instancedMesh>
    </group>
  );
}
