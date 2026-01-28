import { AbsoluteFill, Img, spring, interpolate, staticFile } from "remotion";
import { useCurrentFrame, useVideoConfig } from "remotion";

const COLORS = {
  coral: "#FF6B6B",
  teal: "#2EC4B6",
  dark: "#1A1A2E",
  white: "#FFFFFF",
  coralLight: "#FFF0ED",
};

const fontFamily = "Montserrat, sans-serif";

export const BlankScreen: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF0ED" }} />
  );
};

export const CTAClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const pulse = 1 + Math.sin(frame * 0.15) * 0.02;

  const line1Opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 450,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            opacity: line1Opacity,
          }}
        >
          Kids' parties.
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            opacity: line2Opacity,
          }}
        >
          <span style={{ color: COLORS.teal }}>Sorted.</span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: COLORS.teal,
          color: COLORS.white,
          fontSize: 28,
          fontWeight: 700,
          padding: "18px 50px",
          borderRadius: 50,
          transform: `scale(${pulse})`,
          fontFamily,
          opacity: buttonOpacity,
          marginTop: 20,
        }}
      >
        Try It Free Today
      </div>

      <div
        style={{
          fontSize: 22,
          color: COLORS.dark,
          fontFamily,
          opacity: taglineOpacity,
        }}
      >
        Launching soon in St Albans
      </div>
    </AbsoluteFill>
  );
};
