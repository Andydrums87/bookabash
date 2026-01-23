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

// PartySnap brand colors (from social media content)
const COLORS = {
  coral: "#F87B5E",
  coralLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const PromoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
      {/* Scene 1: Logo Intro (0-90 frames / 0-3 sec) */}
      <Sequence from={0} durationInFrames={90}>
        <LogoIntro frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Problem Statement (90-210 frames / 3-7 sec) */}
      <Sequence from={90} durationInFrames={120}>
        <ProblemScene frame={frame - 90} fps={fps} />
      </Sequence>

      {/* Scene 3: Solution (210-330 frames / 7-11 sec) */}
      <Sequence from={210} durationInFrames={120}>
        <SolutionScene frame={frame - 210} fps={fps} />
      </Sequence>

      {/* Scene 4: Features (330-510 frames / 11-17 sec) */}
      <Sequence from={330} durationInFrames={180}>
        <FeaturesScene frame={frame - 330} fps={fps} />
      </Sequence>

      {/* Scene 5: Social Proof (510-600 frames / 17-20 sec) */}
      <Sequence from={510} durationInFrames={90}>
        <SocialProofScene frame={frame - 510} fps={fps} />
      </Sequence>

      {/* Scene 6: CTA (600-750 frames / 20-25 sec) */}
      <Sequence from={600} durationInFrames={150}>
        <CTAScene frame={frame - 600} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const LogoIntro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const mascotScale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
  });

  const logoOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.coral,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 900,
          height: "auto",
          transform: `scale(${mascotScale})`,
          opacity: logoOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

const ProblemScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const problems = [
    "Searching endless websites",
    "Calling supplier after supplier",
    "Comparing prices everywhere",
    "Coordinating everything yourself",
  ];

  return (
    <AbsoluteFill
      style={{
        padding: 100,
        justifyContent: "center",
      }}
    >
      <AnimatedHeadline frame={frame} fps={fps} delay={0} size={72}>
        {"Kids' parties are "}
        <UnderlinedText frame={frame} delay={20}>
          stressful.
        </UnderlinedText>
      </AnimatedHeadline>

      <div style={{ marginTop: 60 }}>
        {problems.map((problem, i) => (
          <ProblemItem key={i} text={problem} frame={frame} delay={30 + i * 15} />
        ))}
      </div>

      <Img
        src={staticFile("demo-video/Head Only.png")}
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          width: 200,
          height: "auto",
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};

const SolutionScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coral,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Mascot Only (2).png")}
        style={{
          width: 350,
          height: "auto",
          transform: `scale(${spring({ frame, fps, config: { damping: 60, stiffness: 200 } })})`,
        }}
      />

      <div style={{ textAlign: "center" }}>
        <AnimatedHeadline frame={frame} fps={fps} delay={20} size={80} color={COLORS.white}>
          {"Kids' parties."}
        </AnimatedHeadline>
        <AnimatedHeadline frame={frame} fps={fps} delay={35} size={80} color={COLORS.white}>
          Without the chaos.
        </AnimatedHeadline>
      </div>

      <div
        style={{
          fontSize: 36,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame - 50, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        One place. All the party bits.
      </div>
    </AbsoluteFill>
  );
};

const FeaturesScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const features = [
    { icon: "🎪", title: "Entertainment", desc: "Magicians, face painters & more" },
    { icon: "🎂", title: "Cakes", desc: "Custom bakers near you" },
    { icon: "🎈", title: "Decorations", desc: "Balloons & party styling" },
    { icon: "🎁", title: "Party Bags", desc: "Pre-filled and ready" },
  ];

  return (
    <AbsoluteFill
      style={{
        padding: 80,
        justifyContent: "center",
      }}
    >
      <AnimatedHeadline frame={frame} fps={fps} delay={0} size={64}>
        Everything you need
      </AnimatedHeadline>

      <div
        style={{
          display: "flex",
          gap: 50,
          marginTop: 60,
          justifyContent: "center",
        }}
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} frame={frame} fps={fps} delay={20 + i * 20} />
        ))}
      </div>

      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          width: 250,
          height: "auto",
        }}
      />
    </AbsoluteFill>
  );
};

const SocialProofScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <div
        style={{
          fontSize: 120,
          transform: `scale(${scale})`,
        }}
      >
        ⭐ 4.9
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Rated Excellent on Trustpilot
      </div>
      <div
        style={{
          fontSize: 32,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        3,000+ Happy Parents
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("demo-video/2.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: 100,
        }}
      >
        <AnimatedHeadline frame={frame} fps={fps} delay={0} size={80}>
          Less organising.
        </AnimatedHeadline>
        <AnimatedHeadline frame={frame} fps={fps} delay={15} size={80}>
          {"More "}
          <UnderlinedText frame={frame} delay={30}>
            celebrating.
          </UnderlinedText>
        </AnimatedHeadline>

        <div
          style={{
            backgroundColor: COLORS.dark,
            color: COLORS.white,
            fontSize: 36,
            fontWeight: 700,
            padding: "20px 50px",
            borderRadius: 50,
            marginTop: 50,
            transform: `scale(${pulse})`,
            fontFamily: "system-ui, sans-serif",
            opacity: interpolate(frame - 45, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Start Planning Free
        </div>

        <div
          style={{
            fontSize: 28,
            color: COLORS.dark,
            fontFamily: "system-ui, sans-serif",
            marginTop: 30,
            opacity: interpolate(frame - 60, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Launching soon in St Albans
        </div>
      </div>

      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          width: 220,
          height: "auto",
        }}
      />
    </AbsoluteFill>
  );
};

// Shared components
const AnimatedHeadline: React.FC<{
  children: React.ReactNode;
  frame: number;
  fps: number;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ children, frame, fps, delay = 0, size = 64, color = COLORS.dark }) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
        transform: `translateY(${interpolate(y, [0, 1], [40, 0])}px)`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
};

const UnderlinedText: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const width = interpolate(frame - delay, [0, 20], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: 0,
          width: `${width}%`,
          height: 8,
          backgroundColor: COLORS.coral,
          borderRadius: 4,
        }}
      />
    </span>
  );
};

const ProblemItem: React.FC<{ text: string; frame: number; delay: number }> = ({
  text,
  frame,
  delay,
}) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const strikeWidth = interpolate(frame - delay - 20, [0, 15], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        fontSize: 36,
        color: COLORS.dark,
        fontFamily: "system-ui, sans-serif",
        padding: "10px 0",
        opacity,
      }}
    >
      😫 {text}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: `${strikeWidth}%`,
          height: 3,
          backgroundColor: COLORS.coral,
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

const FeatureCard: React.FC<{
  feature: { icon: string; title: string; desc: string };
  frame: number;
  fps: number;
  delay: number;
}> = ({ feature, frame, fps, delay }) => {
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 60, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 28,
          backgroundColor: COLORS.white,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 64,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        {feature.icon}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {feature.title}
      </div>
      <div
        style={{
          fontSize: 20,
          color: "#666",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          maxWidth: 180,
        }}
      >
        {feature.desc}
      </div>
    </div>
  );
};
