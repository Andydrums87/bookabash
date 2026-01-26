import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
  staticFile,
  OffthreadVideo,
  Audio,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const COLORS = {
  coral: "#F87B5E",
  coralLight: "#FFF0ED",
  teal: "#14b8a6",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

// iPhone-style phone mockup component - large for mobile video
const PhoneMockup: React.FC<{
  children: React.ReactNode;
  screenWidth?: number;
  screenHeight?: number;
}> = ({ children, screenWidth = 520, screenHeight = 1120 }) => {
  const frameWidth = screenWidth + 24;
  const frameHeight = screenHeight + 110;

  return (
    <div
      style={{
        width: frameWidth,
        height: frameHeight,
        backgroundColor: "#1a1a1a",
        borderRadius: 60,
        padding: "55px 12px",
        position: "relative",
        boxShadow: "0 40px 80px rgba(0,0,0,0.4), inset 0 0 0 3px #333",
      }}
    >
      {/* Dynamic Island / Notch */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 150,
          height: 36,
          backgroundColor: "#000",
          borderRadius: 24,
        }}
      />

      {/* Screen content */}
      <div
        style={{
          width: screenWidth,
          height: screenHeight,
          backgroundColor: "#fff",
          borderRadius: 44,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 160,
          height: 6,
          backgroundColor: "#fff",
          borderRadius: 3,
          opacity: 0.6,
        }}
      />
    </div>
  );
};

// Screen Studio style scene - floating 3D video without phone frame
const ScreenStudioScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  stepNumber: number;
  accentColor: string;
  sceneDuration?: number;
}> = ({ frame, fps, videoSrc, stepNumber, accentColor, sceneDuration = 450 }) => {
  // Scene fade in/out
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitStart = sceneDuration - 25;
  const sceneExit = interpolate(frame, [exitStart, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating entrance animation - comes from bottom with spring
  const floatSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 30, stiffness: 80, mass: 1.2 },
  });

  // Start from below and float up
  const translateY = interpolate(floatSpring, [0, 1], [150, 0]);
  const videoScale = interpolate(floatSpring, [0, 1], [0.85, 1]);
  const videoOpacity = interpolate(floatSpring, [0, 1], [0, 1]);

  // Subtle 3D rotation for that dynamic floating feel
  const rotateX = interpolate(floatSpring, [0, 1], [8, 2]);
  const rotateY = interpolate(frame, [0, sceneDuration], [-1, 1]);

  // Subtle floating motion once settled
  const floatY = Math.sin(frame * 0.05) * 8;
  const floatRotate = Math.sin(frame * 0.03) * 0.5;

  // Progress dots
  const dotsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        perspective: 1200,
      }}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at center, transparent 0%, ${COLORS.coralLight} 70%)`,
          opacity: 0.5,
        }}
      />

      {/* Screen Studio video - centered with 3D transforms */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `
            translate(-50%, -50%)
            translateY(${translateY + floatY}px)
            scale(${videoScale})
            rotateX(${rotateX}deg)
            rotateY(${rotateY + floatRotate}deg)
          `,
          opacity: videoOpacity,
          transformStyle: "preserve-3d",
          // The video container - sized to fit nicely in vertical frame
          width: "95%",
          maxWidth: 1000,
        }}
      >
        {/* Shadow layer for 3D depth */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "5%",
            right: "5%",
            bottom: -20,
            background: "rgba(0,0,0,0.3)",
            filter: "blur(40px)",
            borderRadius: 30,
            transform: "translateZ(-50px)",
          }}
        />

        {/* The actual video */}
        <OffthreadVideo
          src={videoSrc}
          volume={0}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 20,
            boxShadow: `
              0 25px 50px rgba(0,0,0,0.15),
              0 10px 20px rgba(0,0,0,0.1)
            `,
          }}
        />
      </div>

      {/* Progress dots at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          opacity: dotsOpacity,
        }}
      >
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            style={{
              width: num === stepNumber ? 36 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: num === stepNumber ? accentColor : "#ddd",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Underlined text component with coral highlight
const UnderlinedText: React.FC<{
  children: React.ReactNode;
  color?: string;
  underlineProgress: number;
}> = ({ children, color = COLORS.coral, underlineProgress }) => {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <div
        style={{
          position: "absolute",
          bottom: -8,
          left: 0,
          width: `${underlineProgress * 100}%`,
          height: 20,
          backgroundColor: color,
          opacity: 0.4,
          transform: "skewX(-6deg)",
          borderRadius: 6,
        }}
      />
    </span>
  );
};

export const HomepageHeroMobile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Background music */}
      <Audio src={staticFile("demo-video/promo-448817.mp3")} volume={0.5} />

      {/* Scene 1: Text intro (0-120 frames / 0-4 sec) */}
      <Sequence from={0} durationInFrames={120}>
        <StressedParentScene frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Transition - "There's a better way" (120-180 frames / 4-6 sec) */}
      <Sequence from={120} durationInFrames={60}>
        <TransitionScene frame={frame - 120} fps={fps} />
      </Sequence>

      {/* Scene 3: Logo Animation (180-270 frames / 6-9 sec) */}
      <Sequence from={180} durationInFrames={90}>
        <LogoAnimationScene frame={frame - 180} fps={fps} />
      </Sequence>

      {/* Scene 4a: Step 1 Title - "Tell us about your party" (270-350 frames / 9-11.7 sec) */}
      <Sequence from={270} durationInFrames={80}>
        <StepTitleScene
          frame={frame - 270}
          fps={fps}
          stepNumber={1}
          title="Tell us about"
          highlightedWord="your party"
          subtitle="Quick & easy form"
        />
      </Sequence>

      {/* Scene 4b: Step 1 Phone - Form Filling (350-500 frames / 11.7-16.7 sec) */}
      <Sequence from={350} durationInFrames={150}>
        <PhoneDemoScene
          frame={frame - 350}
          fps={fps}
          videoSrc={staticFile("demo-video/formfilling.MP4")}
          stepNumber={1}
          accentColor={COLORS.coral}
        />
      </Sequence>

      {/* Scene 5a: Step 2 Title - "We build your plan" (500-580 frames / 16.7-19.3 sec) */}
      <Sequence from={500} durationInFrames={80}>
        <StepTitleScene
          frame={frame - 500}
          fps={fps}
          stepNumber={2}
          title="We build"
          highlightedWord="your plan"
          subtitle="Only trusted suppliers"
        />
      </Sequence>

      {/* Scene 5b: Step 2 Phone - Dashboard Suppliers (580-1510 frames / 19.3-50.3 sec) - full 31 second video */}
      <Sequence from={580} durationInFrames={930}>
        <PhoneDemoScene
          frame={frame - 580}
          fps={fps}
          videoSrc={staticFile("demo-video/dashboard-suppliers.MP4")}
          stepNumber={2}
          accentColor={COLORS.teal}
          sceneDuration={930}
        />
      </Sequence>

      {/* Scene 6a: Step 3 Title - "Add suppliers to your plan" (1510-1590 frames / 50.3-53 sec) */}
      <Sequence from={1510} durationInFrames={80}>
        <StepTitleScene
          frame={frame - 1510}
          fps={fps}
          stepNumber={3}
          title="Add suppliers to"
          highlightedWord="your plan"
          subtitle="Book with one click"
        />
      </Sequence>

      {/* Scene 6b: Step 3 Phone - Add Suppliers (1590-2172 frames / 53-72.4 sec) - 19.4 second video (cut 2s from end) */}
      <Sequence from={1590} durationInFrames={582}>
        <PhoneDemoScene
          frame={frame - 1590}
          fps={fps}
          videoSrc={staticFile("demo-video/add suppliers.MP4")}
          stepNumber={3}
          accentColor={COLORS.coral}
          sceneDuration={582}
        />
      </Sequence>

      {/* Scene 7: CTA (2172-2322 frames / 72.4-77.4 sec) */}
      <Sequence from={2172} durationInFrames={150}>
        <CTAScene frame={frame - 2172} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const StressedParentScene: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const text1Opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const text2Opacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const text3Opacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sceneOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 50,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily,
            opacity: text1Opacity,
            marginBottom: 24,
          }}
        >
          15 supplier websites...
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily,
            opacity: text2Opacity,
            marginBottom: 24,
          }}
        >
          23 browser tabs...
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily,
            opacity: text3Opacity,
          }}
        >
          4 hours of research...
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: COLORS.coral,
            fontFamily,
            marginTop: 48,
            opacity: interpolate(frame, [75, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Sound familiar?
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TransitionScene: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const textOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: COLORS.dark,
          fontFamily,
          opacity: textOpacity,
          textAlign: "center",
          padding: 40,
        }}
      >
        There's a{" "}
        <span style={{ color: COLORS.teal }}>better</span> way
      </div>
    </AbsoluteFill>
  );
};

const LogoAnimationScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoDelay = 15;

  const logoScaleSpring = spring({
    frame: frame - logoDelay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.5 },
  });

  const logoOpacity = interpolate(frame, [logoDelay, logoDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subheadingOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitProgress = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: logoOpacity,
          transform: `scale(${logoScaleSpring})`,
        }}
      >
        <Img
          src={staticFile("demo-video/Transparent With Text (5).png")}
          style={{
            width: 400,
            height: "auto",
            filter: `drop-shadow(0 0 20px ${COLORS.coral}50)`,
          }}
        />

        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
            opacity: subheadingOpacity,
            textAlign: "center",
          }}
        >
          Book your party in a{" "}
          <span style={{ color: COLORS.teal }}>snap</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Fancy title screen before each step
const StepTitleScene: React.FC<{
  frame: number;
  fps: number;
  stepNumber: number;
  title: string;
  highlightedWord: string;
  subtitle: string;
}> = ({ frame, fps, stepNumber, title, highlightedWord, subtitle }) => {
  // Scene opacity
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneExit = interpolate(frame, [60, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Step number badge
  const badgeSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 40, stiffness: 200 },
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  // Title animation
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 40, stiffness: 100 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlighted word animation
  const highlightSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 35, stiffness: 80 },
  });
  const highlightY = interpolate(highlightSpring, [0, 1], [40, 0]);
  const highlightOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Underline animation
  const underlineProgress = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subtitleOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative elements
  const sparkleOpacity = interpolate(frame, [45, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `4px solid ${COLORS.coral}20`,
          transform: `scale(${badgeSpring})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `4px solid ${COLORS.teal}20`,
          transform: `scale(${highlightSpring})`,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          padding: 40,
        }}
      >
        {/* Step badge */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: COLORS.coral,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 15px 50px ${COLORS.coral}50`,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily,
            }}
          >
            {stepNumber}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.dark,
            fontFamily,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          {title}
        </div>

        {/* Highlighted word with underline */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            opacity: highlightOpacity,
            transform: `translateY(${highlightY}px)`,
            textAlign: "center",
          }}
        >
          <UnderlinedText underlineProgress={underlineProgress}>
            {highlightedWord}
          </UnderlinedText>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
            opacity: subtitleOpacity * 0.7,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Sparkles */}
      {[
        { x: -300, y: -250, size: 28 },
        { x: 320, y: -200, size: 24 },
        { x: -280, y: 220, size: 26 },
        { x: 300, y: 260, size: 30 },
        { x: -150, y: -350, size: 22 },
        { x: 180, y: 350, size: 24 },
      ].map((sparkle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: sparkle.x,
            marginTop: sparkle.y,
            fontSize: sparkle.size,
            opacity: sparkleOpacity,
            color: i % 2 === 0 ? COLORS.coral : COLORS.teal,
            transform: `rotate(${frame * 2}deg)`,
          }}
        >
          ✦
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Phone demo scene (just the phone, no title)
const PhoneDemoScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  stepNumber: number;
  accentColor: string;
  sceneDuration?: number;
}> = ({ frame, fps, videoSrc, stepNumber, accentColor, sceneDuration = 150 }) => {
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitStart = sceneDuration - 20;
  const sceneExit = interpolate(frame, [exitStart, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phone animation
  const phoneSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 50, stiffness: 100 },
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // Progress dots
  const dotsOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
      }}
    >
      {/* Phone mockup - centered and large */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${phoneScale})`,
          opacity: phoneOpacity,
        }}
      >
        <PhoneMockup screenWidth={520} screenHeight={1120}>
          <OffthreadVideo
            src={videoSrc}
            volume={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </PhoneMockup>
      </div>

      {/* Progress dots at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          opacity: dotsOpacity,
        }}
      >
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            style={{
              width: num === stepNumber ? 36 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: num === stepNumber ? accentColor : "#ddd",
            }}
          />
        ))}
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

  const pulse = 1 + Math.sin(frame * 0.15) * 0.02;

  const line1Opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        padding: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 320,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            opacity: line1Opacity,
          }}
        >
          Less faff.
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            opacity: line2Opacity,
          }}
        >
          More <span style={{ color: COLORS.teal }}>celebrating.</span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: COLORS.teal,
          color: COLORS.white,
          fontSize: 24,
          fontWeight: 700,
          padding: "16px 40px",
          borderRadius: 50,
          transform: `scale(${pulse})`,
          fontFamily,
          opacity: buttonOpacity,
          marginTop: 16,
        }}
      >
        Start Planning Free
      </div>

      <div
        style={{
          fontSize: 18,
          color: COLORS.dark,
          fontFamily,
          opacity: taglineOpacity,
        }}
      >
        Launching soon in St Albans
      </div>
    </AbsoluteFill>
  );
};
