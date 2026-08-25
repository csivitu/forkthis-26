export interface PointerPosition {
  x: number;
  y: number;
}

export interface FlightInput {
  progress: number;
  pointer: PointerPosition;
}

export interface PlanetConfig {
  position: [number, number, number];
  radius: number;
  color: string;
  emissive: string;
  atmosphere: string;
  rotationSpeed: number;
  ring?: {
    inner: number;
    outer: number;
    color: string;
    tilt: [number, number, number];
  };
}
