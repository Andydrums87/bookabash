import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const COLORS = {
  primary: "#FF7247",
  background: "#fff2f0",
  dark: "#1a1a2e",
  white: "#FFFFFF",
  expectationBg: "#E8F5E9", // Soft green for "easy" expectation
  realityBg: "#fff2f0", // Your brand cream
};

const LOGO_URL =
  "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png";

// Timing constants
const FPS = 30;

export const ExpectationVsReality: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Screen 1: "Planning a kids' party" - Hook */}
      <Sequence from={0} durationInFrames={75}>
        <HookScreen fps={fps} />
      </Sequence>

      {/* Screen 2: Expectation - "Pick a theme. Book a venue. Done." */}
      <Sequence from={75} durationInFrames={90}>
        <ExpectationScreen fps={fps} />
      </Sequence>

      {/* Screen 3: "Reality:" - Dramatic pause */}
      <Sequence from={165} durationInFrames={45}>
        <RealityIntroScreen fps={fps} />
      </Sequence>

      {/* Screen 4: The reality list - Key slide */}
      <Sequence from={210} durationInFrames={135}>
        <RealityListScreen fps={fps} />
      </Sequence>

      {/* Screen 5: "Still not booked." */}
      <Sequence from={345} durationInFrames={75}>
        <StillNotBookedScreen fps={fps} />
      </Sequence>

      {/* Screen 6: Soft close with CTA */}
      <Sequence from={420} durationInFrames={105}>
        <CloseScreen fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Screen 1: Hook
const HookScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 100 },
    from: 0.9,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          color: COLORS.dark,
          fontFamily,
          textAlign: "center",
          lineHeight: 1.3,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        Planning a kids' party
      </div>
    </AbsoluteFill>
  );
};

// Screen 2: Expectation
const ExpectationScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  // "Expectation:" label animation
  const labelOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const lines = ["Pick a theme.", "Book a venue.", "Done."];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.expectationBg,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 80px",
      }}
    >
      {/* Expectation label */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#4CAF50",
          fontFamily,
          marginBottom: 40,
          opacity: labelOpacity,
          textTransform: "uppercase",
          letterSpacing: 3,
        }}
      >
        Expectation
      </div>

      {/* Lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {lines.map((line, i) => {
          const lineDelay = 15 + i * 20;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const lineY = spring({
            frame: Math.max(0, frame - lineDelay),
            fps,
            config: { damping: 80, stiffness: 120 },
            from: 20,
            to: 0,
          });

          return (
            <div
              key={i}
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: COLORS.dark,
                fontFamily,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
              }}
            >
              {line === "Done." ? (
                <span style={{ color: "#4CAF50" }}>{line}</span>
              ) : (
                line
              )}
            </div>
          );
        })}
      </div>

      {/* Checkmark animation for "Done" */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 120,
          opacity: interpolate(frame, [70, 85], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ✓
      </div>
    </AbsoluteFill>
  );
};

// Screen 3: "Reality:" intro
const RealityIntroScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
    from: 1.3,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: COLORS.primary,
          fontFamily,
          textTransform: "uppercase",
          letterSpacing: 4,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        Reality:
      </div>
    </AbsoluteFill>
  );
};

// Screen 4: Reality list - the key slide
const RealityListScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const lines = [
    "Availability.",
    "Prices.",
    "Waiting for replies.",
    "Chasing replies.",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {lines.map((line, i) => {
          const lineDelay = i * 27;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const lineY = spring({
            frame: Math.max(0, frame - lineDelay),
            fps,
            config: { damping: 80, stiffness: 120 },
            from: 25,
            to: 0,
          });

          return (
            <div
              key={i}
              style={{
                fontSize: 55,
                fontWeight: 700,
                color: COLORS.dark,
                fontFamily,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Screen 5: "Still not booked."
const StillNotBookedScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 100 },
    from: 0.95,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          color: COLORS.dark,
          fontFamily,
          textAlign: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        Still not booked.
      </div>
    </AbsoluteFill>
  );
};

// Screen 6: Soft close with CTA
const CloseScreen: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();

  // Main text animation
  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 100 },
    from: 30,
    to: 0,
  });

  // Footer animation (logo + tagline)
  const footerDelay = 45;
  const footerOpacity = interpolate(
    frame,
    [footerDelay, footerDelay + 20],
    [0, 0.9],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const footerY = spring({
    frame: Math.max(0, frame - footerDelay),
    fps,
    config: { damping: 80, stiffness: 100 },
    from: 20,
    to: 0,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Main message */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.dark,
          fontFamily,
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          marginBottom: 60,
        }}
      >
        It shouldn't be this hard.
      </div>

      {/* Footer with logo and tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: footerOpacity,
          transform: `translateY(${footerY}px)`,
        }}
      >
        <Img
          src={LOGO_URL}
          style={{
            width: 200,
            height: "auto",
          }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
          }}
        >
          Kids' parties.{" "}
          <span style={{ color: COLORS.primary }}>Sorted.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
