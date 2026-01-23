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
  white: "#FFFFFF",
  dark: "#212529",
};

const themes = [
  {
    name: "Princess & Fairy Tale",
    emoji: "👸",
    colors: ["#FFB6C1", "#FF69B4", "#DB7093"],
    elements: ["👑", "🏰", "✨", "🦄"],
  },
  {
    name: "Superhero Adventure",
    emoji: "🦸",
    colors: ["#1E90FF", "#FF4500", "#FFD700"],
    elements: ["💥", "⚡", "🦸‍♂️", "🎭"],
  },
  {
    name: "Dinosaur Discovery",
    emoji: "🦕",
    colors: ["#228B22", "#8B4513", "#DAA520"],
    elements: ["🦖", "🌋", "🥚", "🦴"],
  },
  {
    name: "Unicorn Magic",
    emoji: "🦄",
    colors: ["#E6E6FA", "#DDA0DD", "#FF69B4"],
    elements: ["🌈", "⭐", "🎀", "💖"],
  },
  {
    name: "Space Explorer",
    emoji: "🚀",
    colors: ["#191970", "#4B0082", "#000080"],
    elements: ["🌙", "⭐", "🛸", "👽"],
  },
];

export const ThemeShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={90}>
        <IntroScene frame={frame} fps={fps} />
      </Sequence>

      {/* Theme showcases */}
      {themes.map((theme, i) => (
        <Sequence key={i} from={90 + i * 120} durationInFrames={120}>
          <ThemeCard theme={theme} frame={frame - (90 + i * 120)} fps={fps} />
        </Sequence>
      ))}

      {/* AI Matching */}
      <Sequence from={690} durationInFrames={90}>
        <AIMatchingScene frame={frame - 690} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={780} durationInFrames={90}>
        <CTAScene frame={frame - 780} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const IntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const emojis = ["🎈", "🎂", "🎉", "🎁", "🎊"];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.coral}, #FF8A6C)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      {/* Floating emojis */}
      {emojis.map((emoji, i) => {
        const x = Math.sin(frame * 0.03 + i * 2) * 300;
        const y = Math.cos(frame * 0.02 + i * 1.5) * 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + x,
              top: 540 + y,
              fontSize: 60,
              opacity: 0.3,
            }}
          >
            {emoji}
          </div>
        );
      })}

      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.white,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        Pick Your Theme
      </div>
      <div
        style={{
          fontSize: 42,
          color: COLORS.white,
          opacity: 0.9,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        AI matches perfect suppliers ✨
      </div>
    </AbsoluteFill>
  );
};

const ThemeCard: React.FC<{
  theme: (typeof themes)[0];
  frame: number;
  fps: number;
}> = ({ theme, frame, fps }) => {
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const rotation = interpolate(frame, [0, 120], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Floating theme elements */}
      {theme.elements.map((element, i) => {
        const angle = (rotation + i * 90) * (Math.PI / 180);
        const radius = 350;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + x,
              top: 540 + y,
              fontSize: 80,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {element}
          </div>
        );
      })}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${slideIn})`,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 40,
          padding: "60px 100px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>{theme.emoji}</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: COLORS.dark,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          {theme.name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AIMatchingScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const matchingItems = [
    { icon: "🎪", label: "Themed Entertainment" },
    { icon: "🎂", label: "Matching Cakes" },
    { icon: "🎈", label: "Coordinated Decor" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #4F46E5, #7C3AED)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 50,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.white,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span style={{ fontSize: 80 }}>🤖</span>
        AI-Powered Matching
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {matchingItems.map((item, i) => {
          const delay = 20 + i * 15;
          const itemScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 60, stiffness: 200 },
          });

          return (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 24,
                padding: "40px 50px",
                transform: `scale(${itemScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 64 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 28,
                  color: COLORS.white,
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.coral}, #FF8A6C)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.white,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        What's Your Theme?
      </div>
      <div
        style={{
          backgroundColor: COLORS.white,
          color: COLORS.coral,
          fontSize: 36,
          fontWeight: 700,
          padding: "24px 60px",
          borderRadius: 50,
          transform: `scale(${scale * pulse})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Explore Themes 🎨
      </div>
    </AbsoluteFill>
  );
};
