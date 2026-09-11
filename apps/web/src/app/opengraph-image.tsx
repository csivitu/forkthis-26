import { ImageResponse } from "next/og";

export const alt = "ForkThis'26 GitHub Workshop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#030305",
          color: "#f4f4ed",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.04em",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #b7ff3c",
            color: "#b7ff3c",
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.18em",
            padding: "12px 24px",
            textTransform: "uppercase",
          }}
        >
          CSI-VIT presents
        </div>
        <div style={{ display: "flex", fontSize: 112, marginTop: 42 }}>
          ForkThis&apos;26
        </div>
        <div
          style={{
            color: "#a9a9a2",
            display: "flex",
            fontSize: 38,
            letterSpacing: "0.04em",
            marginTop: 20,
          }}
        >
          GitHub Workshop
        </div>
      </div>
    ),
    size,
  );
}
