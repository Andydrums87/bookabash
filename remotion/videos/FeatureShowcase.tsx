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
  purple: "#7C3AED",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
};

const features = [
  {
    icon: "🎨",
    title: "Theme Matching",
    description: "AI picks suppliers that match your party theme perfectly",
    color: COLORS.purple,
  },
  {
    icon: "📅",
    title: "Calendar Sync",
    description: "Google & Outlook integration keeps everything organized",
    color: COLORS.blue,
  },
  {
    icon: "💳",
    title: "Easy Payments",
    description: "Secure checkout with Klarna pay-later options",
    color: COLORS.green,
  },
  {
    icon: "✉️",
    title: "E-Invites",
    description: "Beautiful AI-generated invitations with RSVP tracking",
    color: COLORS.coral,
  },
  {
    icon: "💬",
    title: "Messaging Hub",
    description: "Chat with all suppliers in one place",
    color: COLORS.teal,
  },
  {
    icon: "🎁",
    title: "Gift Registry",
    description: "Guests can view and purchase gifts while RSVPing",
    color: COLORS.yellow,
  },
];

export const FeatureShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${COLORS.coral}, #FF8A6C)`,
          }}
        >
          <IntroTitle frame={frame} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Feature cards - each 90 frames */}
      {features.map((feature, i) => (
        <Sequence key={i} from={60 + i * 90} durationInFrames={90}>
          <FeatureCard
            feature={feature}
            frame={frame - (60 + i * 90)}
            fps={fps}
            index={i}
          />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={600} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${COLORS.coral}, #FF8A6C)`,
          }}
        >
          <OutroCard frame={frame - 600} fps={fps} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const IntroTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        PartySnap Features
      </div>
      <div
        style={{
          fontSize: 36,
          color: COLORS.white,
          opacity: 0.9,
          marginTop: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Everything you need for the perfect party 🎉
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  feature: (typeof features)[0];
  frame: number;
  fps: number;
  index: number;
}> = ({ feature, frame, fps, index }) => {
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const iconBounce = spring({
    frame: frame - 15,
    fps,
    config: { damping: 50, stiffness: 300 },
  });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: feature.color,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: index % 2 === 0 ? "row" : "row-reverse",
          alignItems: "center",
          gap: 100,
          transform: `translateX(${(1 - slideIn) * direction * 200}px)`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 40,
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 150,
            transform: `scale(${iconBounce})`,
          }}
        >
          {feature.icon}
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            opacity: textOpacity,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.white,
              marginBottom: 24,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {feature.title}
          </div>
          <div
            style={{
              fontSize: 36,
              color: COLORS.white,
              opacity: 0.9,
              lineHeight: 1.4,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {feature.description}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 16,
        }}
      >
        {features.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 40 : 16,
              height: 16,
              borderRadius: 8,
              backgroundColor:
                i === index ? COLORS.white : "rgba(255,255,255,0.4)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const OutroCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const buttonPulse = 1 + Math.sin(frame * 0.15) * 0.05;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.white,
          marginBottom: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Ready to get started?
      </div>
      <div
        style={{
          fontSize: 36,
          color: COLORS.white,
          opacity: 0.9,
          marginBottom: 50,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Join 3,000+ happy parents
      </div>
      <div
        style={{
          backgroundColor: COLORS.white,
          color: COLORS.coral,
          fontSize: 32,
          fontWeight: 700,
          padding: "24px 60px",
          borderRadius: 50,
          transform: `scale(${buttonPulse})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Start Planning Free 🐊
      </div>
    </div>
  );
};
