import * as THREE from "three";

export const ABOUT_FLIGHT_POSITION = 0.42;

export const SPACE_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 6, 65),
    new THREE.Vector3(0, 2.5, 18),
    new THREE.Vector3(0, 0.5, 4),
    new THREE.Vector3(-6, 8, -40),
    new THREE.Vector3(7, -2, -95),
    new THREE.Vector3(-7, 4, -155),
    new THREE.Vector3(5, 6, -220),
    new THREE.Vector3(0, 2, -295),
  ],
  false,
  "catmullrom",
  0.42,
);

export function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
