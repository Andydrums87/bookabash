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

const supplierCategories = [
  {
    name: "Entertainment",
    icon: "🎪",
    suppliers: ["Magicians", "Face Painters", "Balloon Artists", "Characters"],
    color: "#8B5CF6",
  },
  {
    name: "Cakes & Treats",
    icon: "🎂",
    suppliers: ["Custom Cakes", "Cupcakes", "Themed Desserts", "Candy Bars"],
    color: "#EC4899",
  },
  {
    name: "Decorations",
    icon: "🎈",
    suppliers: ["Balloon Arches", "Party Styling", "Table Setup", "Backdrops"],
    color: "#F59E0B",
  },
  {
    name: "Activities",
    icon: "🎮",
    suppliers: ["Bouncy Castles", "Soft Play", "Games", "Crafts"],
    color: "#10B981",
  },
];

export const SupplierSpotlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={90}>
        <IntroScene frame={frame} fps={fps} />
      </Sequence>

      {/* Category showcases */}
      {supplierCategories.map((category, i) => (
        <Sequence key={i} from={90 + i * 120} durationInFrames={120}>
          <CategoryShowcase
            category={category}
            frame={frame - (90 + i * 120)}
            fps={fps}
          />
        </Sequence>
      ))}

      {/* Verification badge */}
      <Sequence from={570} durationInFrames={90}>
        <VerificationScene frame={frame - 570} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={660} durationInFrames={90}>
        <CTAScene frame={frame - 660} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const IntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
          transform: `scale(${titleScale})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        100+ Vetted Suppliers
      </div>
      <div
        style={{
          fontSize: 42,
          color: COLORS.white,
          opacity: subtitleOpacity,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        All in one place 🐊
      </div>
    </AbsoluteFill>
  );
};

const CategoryShowcase: React.FC<{
  category: (typeof supplierCategories)[0];
  frame: number;
  fps: number;
}> = ({ category, frame, fps }) => {
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: category.color,
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          gap: 80,
        }}
      >
        {/* Left side - Icon and title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateX(${(1 - slideIn) * -200}px)`,
          }}
        >
          <div
            style={{
              fontSize: 200,
              marginBottom: 30,
            }}
          >
            {category.icon}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.white,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {category.name}
          </div>
        </div>

        {/* Right side - Supplier list */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {category.suppliers.map((supplier, i) => {
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
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  padding: "24px 40px",
                  transform: `scale(${itemScale})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: COLORS.white,
                  }}
                />
                <span
                  style={{
                    fontSize: 36,
                    color: COLORS.white,
                    fontWeight: 600,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {supplier}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VerificationScene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
  });

  const checkmarks = [
    "Background checked",
    "Insurance verified",
    "Reviews validated",
    "Quality assured",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.teal,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 50,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: COLORS.white,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${badgeScale})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ fontSize: 100 }}>✓</span>
      </div>

      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Every Supplier Verified
      </div>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {checkmarks.map((check, i) => {
          const delay = 30 + i * 10;
          const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                fontSize: 28,
                color: COLORS.white,
                opacity,
                fontFamily: "system-ui, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#90EE90" }}>✓</span> {check}
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
        Find Your Perfect
        <br />
        Party Team
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
        Browse Suppliers 🐊
      </div>
    </AbsoluteFill>
  );
};
