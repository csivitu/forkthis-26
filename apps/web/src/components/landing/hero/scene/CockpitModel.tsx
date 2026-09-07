"use client";

import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const COCKPIT_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const COCKPIT_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D cockpitMap;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 sampleColor = texture2D(cockpitMap, vUv);
    float signal = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
    vec3 cockpitGreen = vec3(0.56, 1.0, 0.18);

    vec3 normal = normalize(vNormal);
    normal = gl_FrontFacing ? normal : -normal;
    vec3 viewDirection = normalize(vViewPosition);
    vec3 leftDirection = normalize(vec3(-0.72, 0.56, 0.88));
    vec3 rightDirection = normalize(vec3(0.76, 0.38, 0.82));
    float leftDiffuse = max(dot(normal, leftDirection), 0.0);
    float rightDiffuse = max(dot(normal, rightDirection), 0.0);
    float leftSpecular = pow(
      max(dot(normal, normalize(leftDirection + viewDirection)), 0.0),
      24.0
    );
    float rightSpecular = pow(
      max(dot(normal, normalize(rightDirection + viewDirection)), 0.0),
      28.0
    );
    vec3 reflectedLight = vec3(1.0) * (
      leftDiffuse * 0.04 +
      rightDiffuse * 0.035 +
      leftSpecular * 0.32 +
      rightSpecular * 0.28
    );

    vec3 surfaceTint = vec3(0.30, 0.38, 0.28);
    vec3 darkStructure =
      sampleColor.rgb * surfaceTint * 1.08 + vec3(0.006, 0.010, 0.006);
    vec3 coloredSignal = cockpitGreen * signal * 1.62;
    vec3 finalColor = mix(darkStructure, coloredSignal, smoothstep(0.26, 0.84, signal));
    finalColor += reflectedLight * (1.0 - smoothstep(0.64, 1.0, signal));
    gl_FragColor = vec4(finalColor, sampleColor.a);
  }
`;

function removeDashboardLogo(source: THREE.BufferGeometry) {
  const geometry = source.clone();
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!index) return geometry;

  const keptIndices: number[] = [];
  for (let offset = 0; offset < index.count; offset += 3) {
    let isLogoTriangle = true;

    for (let corner = 0; corner < 3; corner += 1) {
      const vertex = index.getX(offset + corner);
      const x = position.getX(vertex);
      const y = position.getY(vertex);
      const z = position.getZ(vertex);
      const insideLogo =
        x >= -0.85 &&
        x <= -0.73 &&
        y >= 0.55 &&
        y <= 0.66 &&
        z >= -0.08 &&
        z <= 0.08;

      if (!insideLogo) {
        isLogoTriangle = false;
        break;
      }
    }

    if (!isLogoTriangle) {
      keptIndices.push(index.getX(offset), index.getX(offset + 1), index.getX(offset + 2));
    }
  }

  geometry.setIndex(keptIndices);
  geometry.computeBoundingSphere();
  return geometry;
}

function CockpitLight({
  color,
  position,
  rotation,
}: {
  color: string;
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh renderOrder={11}>
        <boxGeometry args={[0.38, 0.038, 0.025]} />
        <meshBasicMaterial color={color} toneMapped={false} depthTest={false} />
      </mesh>
      <mesh position={[0, 0, -0.01]} renderOrder={10}>
        <planeGeometry args={[0.58, 0.15]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.26}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function CockpitModel() {
  const { scene } = useGLTF("/models/cockpit-raw.glb");
  const sourceLightmap = useTexture("/textures/cockpit-bake-lights.png");
  const cockpit = useMemo(() => {
    const lightmap = sourceLightmap.clone();
    lightmap.flipY = false;
    lightmap.colorSpace = THREE.SRGBColorSpace;
    lightmap.minFilter = THREE.LinearFilter;
    lightmap.magFilter = THREE.LinearFilter;
    lightmap.generateMipmaps = false;
    lightmap.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      uniforms: { cockpitMap: { value: lightmap } },
      vertexShader: COCKPIT_VERTEX_SHADER,
      fragmentShader: COCKPIT_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      toneMapped: false,
      fog: false,
    });
    const object = scene.clone(true);
    const geometries: THREE.BufferGeometry[] = [];
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = removeDashboardLogo(child.geometry);
      child.geometry = geometry;
      child.material = material;
      child.frustumCulled = false;
      geometries.push(geometry);
    });

    return { geometries, lightmap, material, object };
  }, [scene, sourceLightmap]);

  useEffect(
    () => () => {
      cockpit.material.dispose();
      cockpit.lightmap.dispose();
      cockpit.geometries.forEach((geometry) => geometry.dispose());
    },
    [cockpit],
  );

  return (
    <group>
      <primitive
        object={cockpit.object}
        position={[0, -1.65, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={1.05}
      />
      <CockpitLight color="#ffffff" position={[-0.98, 0.67, 0.08]} rotation={0.2} />
      <CockpitLight color="#ffffff" position={[0.98, 0.67, 0.08]} rotation={-0.2} />
    </group>
  );
}

useGLTF.preload("/models/cockpit-raw.glb");
useTexture.preload("/textures/cockpit-bake-lights.png");
