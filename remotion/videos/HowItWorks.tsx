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
};

const steps = [
  {
    number: 1,
    title: "Tell Us About Your Party",
    description: "Date, theme, guest count, and location",
    icon: "📝",
    color: COLORS.coral,
  },
  {
    number: 2,
    title: "AI Finds Your Matches",
    description: "Vetted suppliers matched to your theme",
    icon: "🤖",
    color: COLORS.purple,
  },
  {
    number: 3,
    title: "Review & Customize",
    description: "Browse packages and personalize your party",
    icon: "👀",
    color: COLORS.blue,
  },
  {
    number: 4,
    title: "Book & Pay Securely",
    description: "One checkout for everything",
    icon: "💳",
    color: COLORS.green,
  },
  {
    number: 5,
    title: "Enjoy Your Party!",
    description: "We handle the coordination",
    icon: "🎉",
    color: COLORS.teal,
  },
];

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={60}>
        <IntroScene frame={frame} fps={fps} />
      </Sequence>

      {/* Steps */}
      {steps.map((step, i) => (
        <Sequence key={i} from={60 + i * 90} durationInFrames={90}>
          <StepScene step={step} frame={frame - (60 + i * 90)} fps={fps} totalSteps={steps.length} />
        </Sequence>
      ))}

      {/* Time comparison */}
      <Sequence from={510} durationInFrames={90}>
        <TimeComparisonScene frame={frame - 510} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={600} durationInFrames={90}>
        <CTAScene frame={frame - 600} fps={fps} />
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
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.white,
          transform: `scale(${scale})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        How PartySnap Works
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
        5 simple steps to party perfection 🐊
      </div>
    </AbsoluteFill>
  );
};

const StepScene: React.FC<{
  step: (typeof steps)[0];
  frame: number;
  fps: number;
  totalSteps: number;
}> = ({ step, frame, fps, totalSteps }) => {
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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: step.color,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "rgba(255,255,255,0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 48,
          fontWeight: 900,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {step.number}/{totalSteps}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${(1 - slideIn) * 100}px)`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 150,
            marginBottom: 40,
            transform: `scale(${iconBounce})`,
          }}
        >
          {step.icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: 24,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          {step.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 36,
            color: COLORS.white,
            opacity: textOpacity,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          {step.description}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "80%",
          height: 12,
          backgroundColor: "rgba(255,255,255,0.3)",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: `${(step.number / totalSteps) * 100}%`,
            height: "100%",
            backgroundColor: COLORS.white,
            borderRadius: 6,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const TimeComparisonScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const traditionalWidth = interpolate(frame, [20, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const partySnapWidth = interpolate(frame, [40, 60], [0, 15], {
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
        gap: 60,
        padding: 100,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          transform: `scale(${scale})`,
        }}
      >
        Save Hours of Planning
      </div>

      <div style={{ width: "100%", maxWidth: 1200 }}>
        {/* Traditional */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 28,
              color: COLORS.dark,
              marginBottom: 12,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Traditional Way
          </div>
          <div
            style={{
              height: 60,
              backgroundColor: "#ddd",
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${traditionalWidth}%`,
                height: "100%",
                backgroundColor: "#999",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 20,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.white,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {traditionalWidth > 50 ? "5+ hours" : ""}
            </div>
          </div>
        </div>

        {/* PartySnap */}
        <div>
          <div
            style={{
              fontSize: 28,
              color: COLORS.dark,
              marginBottom: 12,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            With PartySnap 🐊
          </div>
          <div
            style={{
              height: 60,
              backgroundColor: "#ddd",
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${partySnapWidth}%`,
                height: "100%",
                backgroundColor: COLORS.coral,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 20,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.white,
                fontFamily: "system-ui, sans-serif",
                minWidth: partySnapWidth > 5 ? 140 : 0,
              }}
            >
              {partySnapWidth > 10 ? "5 mins" : ""}
            </div>
          </div>
        </div>
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
        Ready to Start?
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
        Plan Your Party 🎉
      </div>
    </AbsoluteFill>
  );
};
