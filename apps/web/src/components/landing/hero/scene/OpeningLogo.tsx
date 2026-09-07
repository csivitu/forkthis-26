"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const LOGO_IMAGE = "/assets/logo.png";

export function OpeningLogo() {
  const logo = useRef<THREE.Group>(null);
  const entranceStartedAt = useRef<number | null>(null);
  const sourceLogo = useTexture(LOGO_IMAGE);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const logoWidth = aspect < 0.8 ? 25 : aspect < 1.2 ? 38 : 50;
  const logoHeight = logoWidth * (291.51 / 534.36);
  const logoTexture = useMemo(() => {
    const texture = sourceLogo.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }, [sourceLogo]);

  useEffect(() => () => logoTexture.dispose(), [logoTexture]);

  useFrame((state) => {
    if (!logo.current) return;
    if (entranceStartedAt.current === null) entranceStartedAt.current = state.clock.elapsedTime;

    const elapsed = state.clock.elapsedTime - entranceStartedAt.current;
    const entrance = 1 - Math.exp(-elapsed * 2.9);
    const scale = THREE.MathUtils.lerp(1.35, 1, entrance);
    logo.current.scale.setScalar(scale);
  });

  return (
    <group ref={logo} position={[0, 0.5, 4]} scale={1.35}>
      <mesh scale={[logoWidth, logoHeight, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          alphaTest={0.02}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

useTexture.preload(LOGO_IMAGE);
