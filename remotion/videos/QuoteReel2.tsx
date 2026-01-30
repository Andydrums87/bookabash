import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

// Load Montserrat font
const { fontFamily } = loadFont();

const COLORS = {
  primary: "#FF7247",
  background: "#ff795b",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

// Logo URL (white version for dark background)
const LOGO_URL = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png";

// Timing: each line appears every 0.8-1s (24-30 frames at 30fps)
// Line delay: 27 frames (~0.9s) between each line
const LINE_DELAY_FRAMES = 27;

// Configuration - "Parenting is already a lot" theme
const REEL_CONFIG = {
  screens: [
    {
      // Page 1 – Hook (~2 seconds)
      lines: [
        "Parenting is already a lot.",
      ],
      duration: 60, // 2 seconds
    },
    {
      // Page 2 – Relatable truth (4 lines)
      // Lines at 0s, 0.9s, 1.8s, 2.7s → ~3s
      lines: [
        "Work.",
        "School.",
        "Life admin.",
        "Bedtime battles.",
      ],
      duration: 105, // 3.5 seconds
    },
    {
      // Page 3 – PartySnap tie-in (2 lines, no footer on orange)
      lines: [
        "Planning a kids' party",
        "shouldn't add to it.",
      ],
      showFooter: false,
      duration: 90, // 3 seconds
    },
  ],
};

export const QuoteReel2: React.FC = () => {
  const { fps } = useVideoConfig();
  const { screens } = REEL_CONFIG;

  // Calculate start frames based on variable durations
  let currentFrame = 0;
  const screenStarts = screens.map((screen) => {
    const start = currentFrame;
    currentFrame += screen.duration;
    return start;
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {screens.map((screen, screenIndex) => (
        <Sequence
          key={screenIndex}
          from={screenStarts[screenIndex]}
          durationInFrames={screen.duration}
        >
          <ScreenContent
            lines={screen.lines}
            showFooter={screen.showFooter}
            fps={fps}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface ScreenContentProps {
  lines: string[];
  showFooter?: boolean;
  fps: number;
}

const ScreenContent: React.FC<ScreenContentProps> = ({
  lines,
  showFooter,
  fps,
}) => {
  const frame = useCurrentFrame();

  // Footer animation (only on final screen)
  // Appears after last line + 0.5s (75 frames)
  const footerDelay = 75;
  const footerOpacity = showFooter
    ? interpolate(frame, [footerDelay, footerDelay + 20], [0, 0.9], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const footerY = spring({
    frame: Math.max(0, frame - footerDelay),
    fps,
    config: { damping: 80, stiffness: 100 },
    from: 20,
    to: 0,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 80px",
      }}
    >
      {/* Main text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {lines.map((line, lineIndex) => {
          // Stagger the fade-in for each line (~0.9s between lines)
          const lineDelay = lineIndex * LINE_DELAY_FRAMES;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const lineY = spring({
            frame: Math.max(0, frame - lineDelay),
            fps,
            config: { damping: 80, stiffness: 120 },
            from: 25,
            to: 0,
          });

          return (
            <div
              key={lineIndex}
              style={{
                fontSize: 55,
                fontWeight: 700,
                color: COLORS.white,
                fontFamily,
                lineHeight: 1.4,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* Subtle footer on final screen only */}
      {showFooter && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: footerOpacity,
            transform: `translateY(${footerY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* PartySnap logo */}
          <Img
            src={LOGO_URL}
            style={{
              width: 200,
              height: "auto",
            }}
          />
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: COLORS.white,
              fontFamily,
              marginBottom: 4,
            }}
          >
            Kids' parties. Sorted.
          </div>
          <div
            style={{
              fontSize: 23,
              fontWeight: 400,
              color: COLORS.white,
              fontFamily,
              opacity: 0.7,
            }}
          >
            Launching soon in St Albans
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
