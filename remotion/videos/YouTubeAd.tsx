import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

const COLORS = {
  coral: "#FF6E4C",
  coralLight: "#FFF0ED",
  teal: "#009688",
  dark: "#212529",
  white: "#FFFFFF",
};

export const YouTubeAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Skip button indicator */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: COLORS.white,
          padding: "12px 24px",
          borderRadius: 8,
          fontSize: 18,
          fontFamily: "system-ui, sans-serif",
          zIndex: 100,
        }}
      >
        {frame < 150 ? `Skip in ${Math.ceil((150 - frame) / 30)}` : "Skip Ad →"}
      </div>

      {/* Scene 1: Hook (first 5 seconds - before skip) */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${COLORS.coral} 0%, #FF8A6C 100%)`,
          }}
        >
          <SplitScreen frame={frame} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Product Demo */}
      <Sequence from={150} durationInFrames={180}>
        <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
          <ProductDemo frame={frame - 150} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Testimonial */}
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
          <Testimonial frame={frame - 330} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence from={450} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${COLORS.coral} 0%, #FF8A6C 100%)`,
          }}
        >
          <YouTubeCTA frame={frame - 450} fps={fps} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const SplitScreen: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150 },
  });

  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* Left side - Problem */}
      <div
        style={{
          flex: 1,
          backgroundColor: COLORS.dark,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          transform: `translateX(${(1 - slideIn) * -100}%)`,
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 30 }}>😫</div>
        <div
          style={{
            fontSize: 42,
            color: COLORS.white,
            textAlign: "center",
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Party planning stress?
        </div>
      </div>

      {/* Right side - Solution */}
      <div
        style={{
          flex: 1,
          backgroundColor: COLORS.coral,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          transform: `translateX(${(1 - slideIn) * 100}%)`,
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 30 }}>🥳</div>
        <div
          style={{
            fontSize: 42,
            color: COLORS.white,
            textAlign: "center",
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            opacity: textOpacity,
          }}
        >
          PartySnap handles it all
        </div>
      </div>
    </div>
  );
};

const ProductDemo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const steps = [
    { icon: "📝", text: "Fill one simple form" },
    { icon: "🤖", text: "AI matches perfect suppliers" },
    { icon: "📅", text: "Everything syncs to calendar" },
    { icon: "🎉", text: "Enjoy the party!" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: COLORS.dark,
          marginBottom: 60,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        How it works
      </div>
      <div style={{ display: "flex", gap: 40 }}>
        {steps.map((step, i) => {
          const delay = i * 30;
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 80, stiffness: 200 },
          });
          const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: COLORS.white,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 60,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: COLORS.dark,
                  textAlign: "center",
                  fontWeight: 500,
                  maxWidth: 160,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {step.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Testimonial: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: 100,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 40 }}>⭐⭐⭐⭐⭐</div>
      <div
        style={{
          fontSize: 42,
          color: COLORS.dark,
          textAlign: "center",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          maxWidth: 1200,
          lineHeight: 1.4,
        }}
      >
        "PartySnap saved me hours of stress. Everything was coordinated perfectly!"
      </div>
      <div
        style={{
          fontSize: 28,
          color: COLORS.coral,
          marginTop: 40,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        — Sarah, London
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 40,
        }}
      >
        <img
          src="https://logo.clearbit.com/trustpilot.com"
          style={{ width: 40, height: 40 }}
        />
        <span style={{ fontSize: 24, color: "#666", fontFamily: "system-ui, sans-serif" }}>
          4.9 on Trustpilot • 3,000+ reviews
        </span>
      </div>
    </div>
  );
};

const YouTubeCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 200 },
  });

  const buttonPulse = 1 + Math.sin(frame * 0.2) * 0.05;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.white,
          marginBottom: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        PartySnap 🐊
      </div>
      <div
        style={{
          fontSize: 42,
          color: COLORS.white,
          marginBottom: 50,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Book your party in a snap
      </div>
      <div
        style={{
          backgroundColor: COLORS.white,
          color: COLORS.coral,
          fontSize: 36,
          fontWeight: 700,
          padding: "24px 60px",
          borderRadius: 50,
          transform: `scale(${buttonPulse})`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Start Free Today
      </div>
    </div>
  );
};
