import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Img,
} from "remotion";

const COLORS = {
  primary: "#FF7247",
  primaryLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

// Crocodile only - cropped from original using Cloudinary transformations
const CROC_ONLY_URL = "https://res.cloudinary.com/dghzq6xtd/image/upload/c_crop,w_500,h_400,x_0,y_0/v1752578876/Transparent_With_Text2_xtq8n5.png";

// Full logo with text
const FULL_LOGO_URL = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png";

export const LogoAnimationStory2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Crocodile bounces in alone (frames 0-60)
  const crocScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    from: 0,
    to: 1,
  });

  const crocRotation = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
    from: -20,
    to: 0,
  });

  // Croc is visible until text arrives
  const crocOpacity = interpolate(frame, [55, 65], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: "PartySnap" text flies in from right (frames 60+)
  const textDelay = 60;
  const textFrame = Math.max(0, frame - textDelay);

  const textX = spring({
    frame: textFrame,
    fps,
    config: { damping: 12, stiffness: 120 },
    from: 600,
    to: 0,
  });

  const textOpacity = interpolate(frame, [textDelay, textDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Croc gets "knocked" to the left when text arrives
  const knockFrame = Math.max(0, frame - 60);
  const crocKnockX = spring({
    frame: knockFrame,
    fps,
    config: { damping: 8, stiffness: 80 },
    from: 0,
    to: -200,
  });

  const crocKnockRotation = spring({
    frame: knockFrame,
    fps,
    config: { damping: 10, stiffness: 100 },
    from: 0,
    to: -25,
  });

  // Full logo fades in after collision (frames 80+)
  const fullLogoDelay = 80;
  const fullLogoOpacity = interpolate(frame, [fullLogoDelay, fullLogoDelay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fullLogoScale = spring({
    frame: Math.max(0, frame - fullLogoDelay),
    fps,
    config: { damping: 15, stiffness: 150 },
    from: 0.8,
    to: 1,
  });

  // Phase 3: Tagline appears (frames 120+)
  const taglineDelay = 120;
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
      }}
    >
      {/* Crocodile only - appears first, gets knocked away */}
      {frame < 95 && (
        <Img
          src={CROC_ONLY_URL}
          style={{
            position: "absolute",
            width: 350,
            height: "auto",
            opacity: crocOpacity,
            transform: `
              scale(${crocScale})
              rotate(${crocRotation + crocKnockRotation}deg)
              translateX(${crocKnockX}px)
            `,
          }}
        />
      )}

      {/* "PartySnap" text flies in from right */}
      {frame >= textDelay && frame < 95 && (
        <div
          style={{
            position: "absolute",
            fontSize: 72,
            fontWeight: 700,
            fontStyle: "italic",
            color: COLORS.primary,
            fontFamily: "system-ui, sans-serif",
            opacity: textOpacity,
            transform: `translateX(${textX}px)`,
          }}
        >
          PartySnap
        </div>
      )}

      {/* Full logo appears after collision */}
      {frame >= fullLogoDelay && (
        <Img
          src={FULL_LOGO_URL}
          style={{
            width: 700,
            height: "auto",
            opacity: fullLogoOpacity,
            transform: `scale(${fullLogoScale})`,
          }}
        />
      )}

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 700,
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
