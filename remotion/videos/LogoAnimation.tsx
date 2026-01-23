import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";

const COLORS = {
  coral: "#F87B5E",
  coralLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const LogoAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Scene 1: Snappy head bounces in */}
      <Sequence from={0} durationInFrames={60}>
        <SnappyHeadReveal frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Full mascot reveal */}
      <Sequence from={60} durationInFrames={60}>
        <MascotReveal frame={frame - 60} fps={fps} />
      </Sequence>

      {/* Scene 3: Full logo with text */}
      <Sequence from={120} durationInFrames={90}>
        <FullLogoReveal frame={frame - 120} fps={fps} />
      </Sequence>

      {/* Scene 4: Tagline */}
      <Sequence from={210} durationInFrames={90}>
        <LogoWithTagline frame={frame - 210} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const SnappyHeadReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 40, stiffness: 200 },
    from: 0,
    to: 1,
  });

  const rotation = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 150 },
    from: -30,
    to: 0,
  });

  // Subtle bounce after landing
  const bounce = Math.sin(frame * 0.3) * 3;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("demo-video/Head Only.png")}
        style={{
          width: 500,
          height: "auto",
          transform: `scale(${scale}) rotate(${rotation + bounce}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

const MascotReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 180 },
  });

  // Waving animation
  const wave = Math.sin(frame * 0.4) * 5;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("demo-video/Mascot Only (2).png")}
        style={{
          width: 550,
          height: "auto",
          transform: `scale(${scale}) rotate(${wave}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

const FullLogoReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 900,
          height: "auto",
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

const LogoWithTagline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  const taglineOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineY = spring({
    frame: frame - 15,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 800,
          height: "auto",
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          opacity: taglineOpacity,
          transform: `translateY(${interpolate(taglineY, [0, 1], [30, 0])}px)`,
        }}
      >
        Party planning made easy
      </div>
    </AbsoluteFill>
  );
};
