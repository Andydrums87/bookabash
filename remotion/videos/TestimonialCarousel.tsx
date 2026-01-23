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
  dark: "#212529",
  white: "#FFFFFF",
  gold: "#F59E0B",
};

const testimonials = [
  {
    quote: "PartySnap made planning my daughter's 5th birthday a breeze. Everything was perfect!",
    name: "Emma Thompson",
    location: "Manchester",
    rating: 5,
    avatar: "👩‍🦰",
  },
  {
    quote: "The AI matching found suppliers I never would have discovered. Absolutely brilliant!",
    name: "James Wilson",
    location: "London",
    rating: 5,
    avatar: "👨",
  },
  {
    quote: "From booking to party day, everything was seamless. My kids had the best time!",
    name: "Sarah Ahmed",
    location: "Birmingham",
    rating: 5,
    avatar: "👩",
  },
  {
    quote: "Finally, a platform that understands busy parents. Saved me hours of stress!",
    name: "Michael Chen",
    location: "Leeds",
    rating: 5,
    avatar: "👨‍🦱",
  },
];

export const TestimonialCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={60}>
        <IntroScene frame={frame} fps={fps} />
      </Sequence>

      {/* Testimonials */}
      {testimonials.map((testimonial, i) => (
        <Sequence key={i} from={60 + i * 120} durationInFrames={120}>
          <TestimonialCard
            testimonial={testimonial}
            frame={frame - (60 + i * 120)}
            fps={fps}
            index={i}
          />
        </Sequence>
      ))}

      {/* Trustpilot scene */}
      <Sequence from={540} durationInFrames={90}>
        <TrustpilotScene frame={frame - 540} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={630} durationInFrames={90}>
        <CTAScene frame={frame - 630} fps={fps} />
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
        gap: 20,
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
        What Parents Say
      </div>
      <div
        style={{
          fontSize: 60,
          transform: `scale(${scale})`,
        }}
      >
        💬
      </div>
    </AbsoluteFill>
  );
};

const TestimonialCard: React.FC<{
  testimonial: (typeof testimonials)[0];
  frame: number;
  fps: number;
  index: number;
}> = ({ testimonial, frame, fps, index }) => {
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const quoteOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const infoOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 40,
          padding: 80,
          maxWidth: 1400,
          transform: `scale(${cardScale})`,
          boxShadow: "0 20px 80px rgba(0,0,0,0.1)",
        }}
      >
        {/* Stars */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 40,
          }}
        >
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <span key={i} style={{ fontSize: 48, color: COLORS.gold }}>
              ⭐
            </span>
          ))}
        </div>

        {/* Quote */}
        <div
          style={{
            fontSize: 48,
            color: COLORS.dark,
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 1.4,
            opacity: quoteOpacity,
            fontFamily: "Georgia, serif",
            marginBottom: 50,
          }}
        >
          "{testimonial.quote}"
        </div>

        {/* Author info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            opacity: infoOpacity,
          }}
        >
          <div style={{ fontSize: 64 }}>{testimonial.avatar}</div>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: COLORS.dark,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {testimonial.name}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#666",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {testimonial.location}
            </div>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 16,
        }}
      >
        {testimonials.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 40 : 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: i === index ? COLORS.coral : "#ddd",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const TrustpilotScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  const countUp = Math.min(3000, Math.floor(interpolate(frame, [0, 60], [0, 3000])));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#00B67A",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          transform: `scale(${scale})`,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#00B67A",
              border: "4px solid white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 48, color: COLORS.white }}>★</span>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {countUp.toLocaleString()}+ Reviews
      </div>

      <div
        style={{
          fontSize: 48,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        Rated <strong>Excellent</strong> on Trustpilot
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
        Join Thousands of
        <br />
        Happy Parents
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
        Start Planning 🐊
      </div>
    </AbsoluteFill>
  );
};
