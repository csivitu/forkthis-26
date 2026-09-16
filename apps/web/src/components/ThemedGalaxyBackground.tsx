import Galaxy from "@/components/Galaxy";

export function ThemedGalaxyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <Galaxy
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        density={0.7}
        glowIntensity={0.3}
        hueShift={95}
        mouseInteraction={false}
        rotationSpeed={0.01}
        saturation={0.7}
        speed={0.16}
        transparent
        twinkleIntensity={0.25}
      />
      </div>
    </div>
  );
}
