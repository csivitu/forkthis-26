"use client";

import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const COCKPIT_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const COCKPIT_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D cockpitMap;
  varying vec2 vUv;

  void main() {
    vec4 sampleColor = texture2D(cockpitMap, vUv);
    float signal = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
    vec3 orange = vec3(1.0, 0.25, 0.045);
    vec3 green = vec3(0.37, 1.0, 0.16);
    vec3 red = vec3(1.0, 0.055, 0.025);
    vec3 palette = mix(orange, green, smoothstep(0.08, 0.54, vUv.x));
    palette = mix(palette, red, smoothstep(0.62, 0.96, vUv.x));
    vec3 darkStructure =
      sampleColor.rgb * vec3(0.92, 0.72, 0.60) + vec3(0.012, 0.004, 0.002);
    vec3 coloredSignal = palette * signal * 1.42;
    vec3 finalColor = mix(darkStructure, coloredSignal, smoothstep(0.26, 0.84, signal));
    gl_FragColor = vec4(finalColor, sampleColor.a);
  }
`;

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
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = material;
      child.frustumCulled = false;
    });

    return { lightmap, material, object };
  }, [scene, sourceLightmap]);

  useEffect(
    () => () => {
      cockpit.material.dispose();
      cockpit.lightmap.dispose();
    },
    [cockpit],
  );

  return (
    <primitive
      object={cockpit.object}
      position={[0, -1.5, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}

useGLTF.preload("/models/cockpit-raw.glb");
useTexture.preload("/textures/cockpit-bake-lights.png");
