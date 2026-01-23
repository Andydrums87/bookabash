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
  dark: "#212529",
  white: "#FFFFFF",
  gold: "#F59E0B",
};

export const CountdownTimer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%)`,
      }}
    >
      {/* Animated background particles */}
      <ParticleField frame={frame} />

      {/* Countdown sequence */}
      <Sequence from={0} durationInFrames={30}>
        <CountdownNumber number={3} frame={frame} fps={fps} />
      </Sequence>

      <Sequence from={30} durationInFrames={30}>
        <CountdownNumber number={2} frame={frame - 30} fps={fps} />
      </Sequence>

      <Sequence from={60} durationInFrames={30}>
        <CountdownNumber number={1} frame={frame - 60} fps={fps} />
      </Sequence>

      {/* Explosion reveal */}
      <Sequence from={90} durationInFrames={60}>
        <ExplosionReveal frame={frame - 90} fps={fps} />
      </Sequence>

      {/* Main content */}
      <Sequence from={150} durationInFrames={120}>
        <MainReveal frame={frame - 150} fps={fps} />
      </Sequence>

      {/* Stats */}
      <Sequence from={270} durationInFrames={90}>
        <StatsReveal frame={frame - 270} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={360} durationInFrames={90}>
        <FinalCTA frame={frame - 360} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ParticleField: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    x: (Math.sin(i * 0.5) * 0.5 + 0.5) * 1920,
    y: (Math.cos(i * 0.7) * 0.5 + 0.5) * 1080,
    size: 2 + (i % 4),
    speed: 0.5 + (i % 3) * 0.3,
  }));

  return (
    <>
      {particles.map((p, i) => {
        const y = (p.y + frame * p.speed) % 1080;
        const opacity = 0.1 + Math.sin(frame * 0.05 + i) * 0.1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: COLORS.coral,
              opacity,
            }}
          />
        );
      })}
    </>
  );
};

const CountdownNumber: React.FC<{
  number: number;
  frame: number;
  fps: number;
}> = ({ number, frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 40, stiffness: 400 },
    from: 3,
    to: 1,
  });

  const opacity = interpolate(frame, [20, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 400,
          fontWeight: 900,
          color: COLORS.coral,
          transform: `scale(${scale})`,
          opacity,
          fontFamily: "system-ui, sans-serif",
          textShadow: `0 0 60px ${COLORS.coral}`,
        }}
      >
        {number}
      </div>
    </AbsoluteFill>
  );
};

const ExplosionReveal: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 100 },
    from: 0,
    to: 1,
  });

  const rotation = interpolate(frame, [0, 60], [180, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Burst effect */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const distance = interpolate(frame, [0, 30], [0, 400], {
          extrapolateRight: "clamp",
        });
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        const opacity = interpolate(frame, [20, 60], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: COLORS.coral,
              transform: `translate(${x}px, ${y}px)`,
              opacity,
              boxShadow: `0 0 20px ${COLORS.coral}`,
            }}
          />
        );
      })}

      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: COLORS.white,
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        🐊 PartySnap
      </div>
    </AbsoluteFill>
  );
};

const MainReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const lines = [
    "Book Your Party",
    "In a Snap!",
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {lines.map((line, i) => {
        const delay = i * 20;
        const slideIn = spring({
          frame: frame - delay,
          fps,
          config: { damping: 80, stiffness: 150 },
        });

        const x = interpolate(slideIn, [0, 1], [i % 2 === 0 ? -500 : 500, 0]);

        return (
          <div
            key={i}
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: i === 1 ? COLORS.coral : COLORS.white,
              transform: `translateX(${x}px)`,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const StatsReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const stats = [
    { value: "100+", label: "Vetted Suppliers" },
    { value: "3K+", label: "Happy Parents" },
    { value: "4.9", label: "Star Rating" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 100 }}>
        {stats.map((stat, i) => {
          const delay = i * 15;
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 60, stiffness: 200 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${scale})`,
              }}
            >
              <div
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  color: COLORS.coral,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: COLORS.white,
                  opacity: 0.8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FinalCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const glow = interpolate(Math.sin(frame * 0.1), [-1, 1], [20, 40]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: COLORS.white,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Start Planning Today
      </div>
      <div
        style={{
          backgroundColor: COLORS.coral,
          color: COLORS.white,
          fontSize: 40,
          fontWeight: 700,
          padding: "24px 60px",
          borderRadius: 50,
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${glow}px ${COLORS.coral}`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        partysnap.co.uk
      </div>
    </AbsoluteFill>
  );
};
