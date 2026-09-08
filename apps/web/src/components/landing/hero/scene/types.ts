export interface PointerPosition {
  x: number;
  y: number;
}

export interface FlightState {
  progress: number;
  pointer: PointerPosition;
  paused: boolean;
}

export interface HeroSceneState extends FlightState {
  aboutPhase: number;
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
