import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Great Koi - A digital sanctuary for your wishes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #0f2847 50%, #1a3a5c 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "1px solid rgba(212, 168, 85, 0.15)",
            top: 80,
            left: 100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1px solid rgba(212, 168, 85, 0.1)",
            bottom: 100,
            right: 150,
          }}
        />

        {/* Fish emoji */}
        <div style={{ fontSize: 72, marginBottom: 20 }}>&#128031;</div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 300,
            color: "#e8c878",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          GREAT KOI
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(232, 220, 200, 0.6)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          A digital sanctuary where your wishes swim with beautiful koi
        </div>

        {/* Dots */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["#e87040", "#f0ebe0", "#c44040", "#d4a855", "#e87040"].map(
            (color, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: color,
                  opacity: 0.7,
                }}
              />
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
