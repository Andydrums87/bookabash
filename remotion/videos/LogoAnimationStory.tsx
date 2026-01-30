import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Img,
  staticFile,
} from "remotion";

const COLORS = {
  primary: "#FF7247",
  primaryLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const LogoAnimationStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic zoom - starts big and zooms down to normal size
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 80 },
    from: 2.5,
    to: 1,
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle breathing animation after zoom completes
  const breathe = frame > 60 ? 1 + Math.sin((frame - 60) * 0.03) * 0.02 : 1;

  // Tagline appears after logo lands
  const taglineDelay = 60;
  const taglineOpacity = interpolate(frame, [taglineDelay, taglineDelay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineY = spring({
    frame: Math.max(0, frame - taglineDelay),
    fps,
    config: { damping: 80, stiffness: 120 },
    from: 40,
    to: 0,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      {/* Logo */}
      <Img
        src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png"
        style={{
          width: 700,
          height: "auto",
          opacity: logoOpacity,
          transform: `scale(${logoScale * breathe})`,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.dark,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Kids parties.
        </span>
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.primary,
            fontFamily: "system-ui, sans-serif",
            marginLeft: 16,
          }}
        >
          Sorted.
        </span>
      </div>
    </AbsoluteFill>
  );
};
