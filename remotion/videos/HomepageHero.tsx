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

// Realistic MacBook-style laptop mockup component
const LaptopMockup: React.FC<{
  children: React.ReactNode;
  screenWidth?: number;
  screenHeight?: number;
}> = ({ children, screenWidth = 950, screenHeight = 595 }) => {
  const baseWidth = screenWidth + 24; // Add bezel padding
  const lipWidth = baseWidth + 120;

  return (
    <div>
      {/* Laptop screen */}
      <div
        style={{
          width: baseWidth,
          backgroundColor: "#1a1a1a",
          borderRadius: "16px 16px 0 0",
          padding: "12px 12px 0 12px",
          position: "relative",
        }}
      >
        {/* Camera notch */}
        <div
          style={{
            position: "absolute",
            top: 5,
            left: "50%",
            transform: "translateX(-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#2a2a2a",
            border: "1px solid #3a3a3a",
          }}
        />

        {/* Screen bezel */}
        <div
          style={{
            backgroundColor: "#000",
            borderRadius: "8px 8px 0 0",
            padding: 4,
            paddingBottom: 0,
          }}
        >
          {/* Screen content */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "4px 4px 0 0",
              overflow: "hidden",
              width: screenWidth,
              height: screenHeight,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Laptop base / keyboard area */}
      <div
        style={{
          width: baseWidth,
          height: 12,
          background: "linear-gradient(180deg, #c4c4c4 0%, #e8e8e8 30%, #d4d4d4 100%)",
          borderRadius: "0 0 2px 2px",
          position: "relative",
        }}
      >
        {/* Notch/hinge indent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 4,
            backgroundColor: "#a8a8a8",
            borderRadius: "0 0 8px 8px",
          }}
        />
      </div>

      {/* Bottom lip of laptop */}
      <div
        style={{
          width: lipWidth,
          height: 8,
          background: "linear-gradient(180deg, #d8d8d8 0%, #b8b8b8 100%)",
          borderRadius: "0 0 8px 8px",
          marginLeft: -60,
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};

export const HomepageHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Background music */}
      <Audio src={staticFile("demo-video/promo-448817.mp3")} volume={0.5} />

      {/* Scene 1: Stressed parent AI video (0-240 frames / 0-8 sec) */}
      <Sequence from={0} durationInFrames={240}>
        <StressedParentScene frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Transition - "There's a better way" (240-310 frames / 8-10.3 sec) */}
      <Sequence from={240} durationInFrames={70}>
        <TransitionScene frame={frame - 240} fps={fps} />
      </Sequence>

      {/* Scene 2b: Logo Animation (310-430 frames / 10.3-14.3 sec) */}
      <Sequence from={310} durationInFrames={120}>
        <LogoAnimationScene frame={frame - 310} fps={fps} />
      </Sequence>

      {/* Scene 3a: Step 1 - Party Form (430-580 frames / 14.3-19.3 sec) */}
      <Sequence from={430} durationInFrames={150}>
        <AnimatedDemoScene
          frame={frame - 430}
          fps={fps}
          videoSrc={staticFile("hompagedemo/partyformfill.mp4")}
          stepNumber={1}
          title="Tell us about your party"
          subtitle="Date, guests, theme & location"
          accentColor={COLORS.coral}
        />
      </Sequence>

      {/* Scene 3b: Step 2 - AI Builds Plan (580-730 frames / 19.3-24.3 sec) */}
      <Sequence from={580} durationInFrames={150}>
        <AnimatedDemoScene
          frame={frame - 580}
          fps={fps}
          videoSrc={staticFile("hompagedemo/view and customize your plan.mp4")}
          stepNumber={2}
          title="We build your perfect plan"
          subtitle="View, tweak & customize"
          accentColor={COLORS.teal}
        />
      </Sequence>

      {/* Scene 3c: Step 3 - Dashboard (730-1000 frames / 24.3-33.3 sec) */}
      <Sequence from={730} durationInFrames={270}>
        <AnimatedDemoScene
          frame={frame - 730}
          fps={fps}
          videoSrc={staticFile("hompagedemo/dashboard.mp4")}
          stepNumber={3}
          title="Add suppliers to your plan"
          subtitle="Build your plan with a click"
          accentColor={COLORS.coral}
          sceneDuration={270}
          videoStartDelay={60}
        />
      </Sequence>

      {/* Scene 4a: Features Intro - "And there's even more" (1000-1090 frames / 33.3-36.3 sec) */}
      <Sequence from={1000} durationInFrames={90}>
        <FeaturesIntroScene frame={frame - 1000} fps={fps} />
      </Sequence>

      {/* Scene 4b: Features Carousel - Invites, RSVPs, Gifts (1090-1390 frames / 36.3-46.3 sec) */}
      <Sequence from={1090} durationInFrames={300}>
        <ThreeFeaturesScene frame={frame - 1090} fps={fps} />
      </Sequence>

      {/* Scene 5: CTA (1390-1540 frames / 46.3-51.3 sec) */}
      <Sequence from={1390} durationInFrames={150}>
        <CTAScene frame={frame - 1390} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const StressedParentScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Text overlays appear sequentially
  const text1Opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const text2Opacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const text3Opacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at the end
  const sceneOpacity = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* AI Video background */}
      <OffthreadVideo
        src={staticFile("hompagedemo/output (15).mp4")}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Text overlays on the left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily,
            opacity: text1Opacity,
            marginBottom: 20,
          }}
        >
          15 supplier websites...
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily,
            opacity: text2Opacity,
            marginBottom: 20,
          }}
        >
          23 browser tabs...
        </div>
        <div
          style={{
            fontSize: 48,
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
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.coral,
            fontFamily,
            marginTop: 40,
            opacity: interpolate(frame, [180, 200], [0, 1], {
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
  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
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
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.dark,
          fontFamily,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        There's a{" "}
        <span style={{ color: COLORS.teal }}>better</span> way
      </div>
    </AbsoluteFill>
  );
};

const LogoAnimationScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // === PHASE 1: CINEMATIC LIGHT BURST (frames 0-15) ===
  const burstProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstScale = interpolate(burstProgress, [0, 0.5, 1], [0, 3, 0]);
  const burstOpacity = interpolate(burstProgress, [0, 0.3, 1], [0, 0.8, 0]);

  // === PHASE 2: "INTRODUCING" TEXT (frames 5-35) ===
  // Letter-by-letter reveal
  const introducingText = "INTRODUCING";
  const letterDelay = 2; // frames between each letter

  // Text scale with overshoot
  const textScaleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.5 },
  });
  const textScale = interpolate(textScaleSpring, [0, 1], [0.3, 1]);

  // Text opacity
  const introducingOpacity = interpolate(frame, [5, 12, 28, 38], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch effect on text
  const glitchOffset = frame > 8 && frame < 15 ? Math.sin(frame * 50) * 3 : 0;

  // Text gradient sweep
  const gradientPosition = interpolate(frame, [5, 25], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PHASE 3: EXPANDING RINGS (frames 20-50) ===
  const rings = [
    { delay: 20, color: COLORS.coral },
    { delay: 25, color: COLORS.teal },
    { delay: 30, color: COLORS.coral },
  ];

  // === PHASE 4: PARTICLE EXPLOSION (frames 25-60) ===
  const explosionParticles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const distance = 200 + (i % 3) * 100;
    const delay = 25 + (i % 6) * 2;
    const size = 4 + (i % 4) * 3;
    return {
      angle,
      distance,
      delay,
      size,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  // === PHASE 5: LOGO REVEAL (frames 35-60) ===
  const logoDelay = 35;

  // Logo mask/reveal animation
  const logoRevealProgress = interpolate(frame, [logoDelay, logoDelay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo scale with bounce
  const logoScaleSpring = spring({
    frame: frame - logoDelay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.5 },
  });

  // Logo rotation for dramatic entrance
  const logoRotation = interpolate(frame, [logoDelay, logoDelay + 15], [-5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoOpacity = interpolate(frame, [logoDelay, logoDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PHASE 6: GLOW & SHIMMER (continuous) ===
  const glowPulse = 0.5 + Math.sin(frame * 0.12) * 0.3;
  const shimmerOffset = (frame * 8) % 400;

  // === PHASE 7: SUBHEADING (frames 50-70) ===
  const subheadingDelay = 50;
  const subheadingWords = ["Book", "your", "party", "in", "a", "snap"];

  const subheadingSpring = spring({
    frame: frame - subheadingDelay,
    fps,
    config: { damping: 40, stiffness: 100 },
  });

  // === PHASE 8: SCENE EXIT (frames 105-120) ===
  const exitProgress = interpolate(frame, [105, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.1]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // === BACKGROUND ANIMATIONS ===
  const bgGradientRotation = frame * 0.5;
  const bgPulse = 0.4 + Math.sin(frame * 0.08) * 0.15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        transform: `scale(${exitScale})`,
        opacity: exitOpacity,
      }}
    >
      {/* Animated warm gradient background */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          background: `conic-gradient(from ${bgGradientRotation}deg at 50% 50%,
            ${COLORS.coralLight} 0deg,
            ${COLORS.coral}25 60deg,
            ${COLORS.coralLight} 120deg,
            ${COLORS.teal}20 180deg,
            ${COLORS.coralLight} 240deg,
            ${COLORS.coral}25 300deg,
            ${COLORS.coralLight} 360deg)`,
          transform: "translate(-25%, -25%)",
          opacity: bgPulse,
        }}
      />

      {/* Radial light from center */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.coral}30 0%, transparent 50%)`,
          opacity: interpolate(frame, [30, 50], [0, 0.7], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `scale(${1 + Math.sin(frame * 0.1) * 0.1})`,
        }}
      />

      {/* Initial light burst */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, white 0%, ${COLORS.coral} 30%, transparent 70%)`,
          transform: `scale(${burstScale})`,
          opacity: burstOpacity,
          filter: "blur(20px)",
        }}
      />

      {/* Horizontal light flare */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.coral} 50%, transparent 100%)`,
          opacity: interpolate(frame, [0, 8, 20], [0, 0.9, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `scaleX(${interpolate(frame, [0, 15], [0, 3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
          filter: "blur(2px)",
        }}
      />

      {/* Expanding rings */}
      {rings.map((ring, i) => {
        const ringProgress = interpolate(frame, [ring.delay, ring.delay + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ringScale = interpolate(ringProgress, [0, 1], [0.5, 3]);
        const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.5, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: `3px solid ${ring.color}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
              boxShadow: `0 0 20px ${ring.color}80, inset 0 0 20px ${ring.color}30`,
            }}
          />
        );
      })}

      {/* "INTRODUCING" text with effects */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: 8,
          opacity: introducingOpacity,
          transform: `scale(${textScale}) translateX(${glitchOffset}px)`,
        }}
      >
        {introducingText.split("").map((letter, i) => {
          const letterProgress = interpolate(
            frame,
            [5 + i * letterDelay, 8 + i * letterDelay],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const letterY = interpolate(letterProgress, [0, 1], [50, 0]);
          const letterOpacity = letterProgress;
          const letterRotation = interpolate(letterProgress, [0, 1], [20, 0]);

          return (
            <span
              key={i}
              style={{
                fontSize: 80,
                fontWeight: 900,
                fontFamily,
                color: "transparent",
                backgroundImage: `linear-gradient(90deg, ${COLORS.dark} 0%, ${COLORS.coral} ${gradientPosition}%, ${COLORS.teal} ${gradientPosition + 50}%, ${COLORS.dark} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                textShadow: `0 0 30px ${COLORS.coral}60`,
                opacity: letterOpacity,
                transform: `translateY(${letterY}px) rotate(${letterRotation}deg)`,
                display: "inline-block",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Particle explosion */}
      {explosionParticles.map((particle, i) => {
        const particleProgress = interpolate(
          frame,
          [particle.delay, particle.delay + 25],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const particleX = interpolate(particleProgress, [0, 1], [0, particle.x]);
        const particleY = interpolate(particleProgress, [0, 1], [0, particle.y]);
        const particleOpacity = interpolate(particleProgress, [0, 0.2, 0.8, 1], [0, 1, 0.8, 0]);
        const particleScale = interpolate(particleProgress, [0, 0.3, 1], [0, 1.5, 0.3]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? COLORS.coral : COLORS.teal,
              transform: `translate(${particleX}px, ${particleY}px) scale(${particleScale})`,
              opacity: particleOpacity,
              boxShadow: `0 0 ${particle.size * 2}px ${i % 2 === 0 ? COLORS.coral : COLORS.teal}`,
            }}
          />
        );
      })}

      {/* Floating ambient particles */}
      {Array.from({ length: 15 }, (_, i) => {
        const floatX = Math.sin(frame * 0.02 + i * 2) * 100 + (i - 7) * 120;
        const floatY = Math.cos(frame * 0.015 + i * 1.5) * 80 + (i % 3 - 1) * 200;
        const floatOpacity = 0.4 + Math.sin(frame * 0.05 + i) * 0.2;
        return (
          <div
            key={`float-${i}`}
            style={{
              position: "absolute",
              width: 3 + (i % 3) * 2,
              height: 3 + (i % 3) * 2,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? COLORS.coral : COLORS.teal,
              transform: `translate(${floatX}px, ${floatY}px)`,
              opacity: floatOpacity * interpolate(frame, [20, 40], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              filter: "blur(1px)",
            }}
          />
        );
      })}

      {/* Logo glow layers */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.coral}${Math.floor(glowPulse * 50).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
          opacity: logoOpacity,
          transform: `scale(${logoScaleSpring})`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.teal}30 0%, transparent 50%)`,
          opacity: logoOpacity * 0.5,
          transform: `scale(${logoScaleSpring * 0.8})`,
          filter: "blur(30px)",
        }}
      />

      {/* Main logo with shimmer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          opacity: logoOpacity,
          transform: `scale(${logoScaleSpring}) rotate(${logoRotation}deg)`,
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              width: 700,
              height: "auto",
              filter: `drop-shadow(0 0 25px ${COLORS.coral}70) drop-shadow(0 0 50px ${COLORS.coral}30)`,
            }}
          />
          {/* Shimmer overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(105deg, transparent ${shimmerOffset - 100}px, rgba(255,255,255,0.4) ${shimmerOffset}px, transparent ${shimmerOffset + 100}px)`,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Subheading with word-by-word animation */}
        <div
          style={{
            display: "flex",
            gap: 12,
            opacity: interpolate(frame, [subheadingDelay, subheadingDelay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subheadingWords.map((word, i) => {
            const wordDelay = subheadingDelay + i * 3;
            const wordSpring = spring({
              frame: frame - wordDelay,
              fps,
              config: { damping: 30, stiffness: 150 },
            });
            const wordY = interpolate(wordSpring, [0, 1], [30, 0]);
            const wordOpacity = interpolate(frame, [wordDelay, wordDelay + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isSnap = word === "snap";

            return (
              <span
                key={i}
                style={{
                  fontSize: 38,
                  fontWeight: 600,
                  fontFamily,
                  color: isSnap ? COLORS.teal : COLORS.dark,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  textShadow: isSnap ? `0 0 15px ${COLORS.teal}80` : "none",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Corner accent lines */}
      {[0, 1, 2, 3].map((corner) => {
        const lineProgress = interpolate(frame, [35 + corner * 3, 50 + corner * 3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isHorizontal = corner % 2 === 0;
        const positions = [
          { top: 80, left: 80 },
          { top: 80, right: 80 },
          { bottom: 80, left: 80 },
          { bottom: 80, right: 80 },
        ];
        return (
          <div
            key={corner}
            style={{
              position: "absolute",
              ...positions[corner],
              width: isHorizontal ? 100 : 3,
              height: isHorizontal ? 3 : 100,
              backgroundColor: corner % 2 === 0 ? COLORS.coral : COLORS.teal,
              opacity: lineProgress * 0.7,
              transform: `scale${isHorizontal ? "X" : "Y"}(${lineProgress})`,
              transformOrigin: corner < 2 ? "left" : "right",
              boxShadow: `0 0 8px ${corner % 2 === 0 ? COLORS.coral : COLORS.teal}80`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const AnimatedDemoScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  accentColor: string;
  sceneDuration?: number;
  videoStartDelay?: number;
}> = ({ frame, fps, videoSrc, stepNumber, title, subtitle, accentColor, sceneDuration = 150, videoStartDelay = 0 }) => {
  // Scene entrance
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene exit - dynamic based on scene duration
  const exitStart = sceneDuration - 20;
  const sceneExit = interpolate(frame, [exitStart, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Step number animation - bounces in
  const stepSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 40, stiffness: 300, mass: 0.8 },
  });

  const stepScale = interpolate(stepSpring, [0, 1], [0, 1]);
  const stepRotate = interpolate(stepSpring, [0, 1], [-180, 0]);

  // Title typewriter effect
  const titleProgress = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleTitleLength = Math.floor(titleProgress * title.length);
  const visibleTitle = title.slice(0, visibleTitleLength);
  const showCursor = frame > 15 && frame < 50 && Math.floor(frame / 4) % 2 === 0;

  // Subtitle slide up
  const subtitleSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 60, stiffness: 150 },
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Browser window animation
  const browserSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 50, stiffness: 120 },
  });
  const browserScale = interpolate(browserSpring, [0, 1], [0.8, 1]);
  const browserY = interpolate(browserSpring, [0, 1], [60, 0]);

  // Animated underline under title
  const underlineWidth = interpolate(frame, [45, 65], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating particles animation
  const particleY1 = Math.sin(frame * 0.08) * 15;
  const particleY2 = Math.sin(frame * 0.1 + 1) * 12;
  const particleY3 = Math.sin(frame * 0.06 + 2) * 18;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
      }}
    >
      {/* Floating decorative particles */}
      <div
        style={{
          position: "absolute",
          top: 150 + particleY1,
          left: 80,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: accentColor,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300 + particleY2,
          right: 120,
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: COLORS.teal,
          opacity: 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200 + particleY3,
          left: 150,
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: COLORS.coral,
          opacity: 0.2,
        }}
      />

      {/* Left side - Text content */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 0,
          bottom: 0,
          width: "32%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Step number badge */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${stepScale}) rotate(${stepRotate}deg)`,
            boxShadow: `0 10px 40px ${accentColor}50`,
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily,
            }}
          >
            {stepNumber}
          </span>
        </div>

        {/* Title with typewriter */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: COLORS.dark,
              fontFamily,
              lineHeight: 1.1,
            }}
          >
            {visibleTitle}
            {showCursor && (
              <span style={{ color: accentColor }}>|</span>
            )}
          </div>
          {/* Animated underline */}
          <div
            style={{
              position: "absolute",
              bottom: -8,
              left: 0,
              width: `${underlineWidth}%`,
              height: 6,
              backgroundColor: accentColor,
              borderRadius: 3,
            }}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          {subtitle}
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                width: num === stepNumber ? 40 : 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: num === stepNumber ? accentColor : "#ddd",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right side - Laptop mockup */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: "50%",
          transform: `translateY(-50%) translateY(${browserY}px) scale(${browserScale})`,
        }}
      >
        <LaptopMockup screenWidth={1100} screenHeight={619}>
          <OffthreadVideo
            src={videoSrc}
            volume={0}
            startFrom={videoStartDelay}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
            }}
          />
        </LaptopMockup>
      </div>

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 30,
          left: 80,
          width: 140,
          height: "auto",
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

const ThreeFeaturesScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const features = [
    {
      videoSrc: staticFile("hompagedemo/creat e invites.mp4"),
      title: "Create Invites",
      subtitle: "Beautiful invites, sent in seconds",
      icon: "✉️",
    },
    {
      videoSrc: staticFile("hompagedemo/manage rsvp.mp4"),
      title: "Manage RSVPs",
      subtitle: "Track responses effortlessly",
      icon: "✓",
    },
    {
      videoSrc: staticFile("hompagedemo/make gift registry.mp4"),
      title: "Gift Registry",
      subtitle: "One link, endless gift ideas",
      icon: "🎁",
    },
  ];

  // Each feature shows for ~100 frames (3.3 sec), total ~300 frames for all 3
  const featureDuration = 100;
  const currentFeatureIndex = Math.min(
    Math.floor(frame / featureDuration),
    features.length - 1
  );
  const featureFrame = frame % featureDuration;

  const currentFeature = features[currentFeatureIndex];
  const accentColor = currentFeatureIndex === 1 ? COLORS.teal : COLORS.coral;

  // Scene entrance
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene exit (at end of all features)
  const totalDuration = featureDuration * features.length;
  const sceneExit = interpolate(frame, [totalDuration - 20, totalDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Feature transition animations
  const featureOpacity = interpolate(
    featureFrame,
    [0, 15, featureDuration - 15, featureDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Laptop slide in animation
  const laptopSpring = spring({
    frame: featureFrame,
    fps,
    config: { damping: 50, stiffness: 120 },
  });
  const laptopX = interpolate(laptopSpring, [0, 1], [100, 0]);

  // Title animations
  const titleSpring = spring({
    frame: featureFrame - 5,
    fps,
    config: { damping: 60, stiffness: 150 },
  });

  // Progress indicators
  const progressDots = features.map((_, index) => {
    const isActive = index === currentFeatureIndex;
    const isPast = index < currentFeatureIndex;
    return { isActive, isPast };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
      }}
    >
      {/* Main content - vertically centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 80px",
        }}
      >
        {/* Content row - laptop and feature info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 80,
            width: "100%",
          }}
        >
          {/* Left side - Feature info */}
          <div
            style={{
              width: 320,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              opacity: featureOpacity,
              transform: `translateX(${interpolate(titleSpring, [0, 1], [-30, 0])}px)`,
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 40px ${accentColor}50`,
              }}
            >
              <span style={{ fontSize: 36 }}>{currentFeature.icon}</span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: COLORS.dark,
                fontFamily,
                lineHeight: 1.1,
              }}
            >
              {currentFeature.title}
            </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.dark,
              fontFamily,
              opacity: 0.7,
            }}
          >
            {currentFeature.subtitle}
          </div>

          {/* Progress dots */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
            }}
          >
            {progressDots.map((dot, index) => (
              <div
                key={index}
                style={{
                  width: dot.isActive ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: dot.isActive || dot.isPast ? accentColor : "#ddd",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right side - Laptop with video */}
        <div
          style={{
            opacity: featureOpacity,
            transform: `translateX(${laptopX}px)`,
          }}
        >
          <LaptopMockup screenWidth={950} screenHeight={534}>
            {features.map((feature, index) => (
              <OffthreadVideo
                key={feature.videoSrc}
                src={feature.videoSrc}
                volume={0}
                startFrom={0}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: index === currentFeatureIndex ? "block" : "none",
                }}
              />
            ))}
          </LaptopMockup>
        </div>
      </div>
      </div>

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 20,
          left: 60,
          width: 120,
          height: "auto",
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

// Fancy intro scene before features - "And there's even more..."
const FeaturesIntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Scene entrance
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene exit
  const sceneExit = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "And there's" text animation
  const text1Spring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 40, stiffness: 120 },
  });
  const text1Y = interpolate(text1Spring, [0, 1], [60, 0]);
  const text1Opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "even more" text animation with emphasis
  const text2Spring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 35, stiffness: 100 },
  });
  const text2Y = interpolate(text2Spring, [0, 1], [60, 0]);
  const text2Opacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const text2Scale = interpolate(text2Spring, [0, 0.7, 1], [0.8, 1.1, 1]);

  // Sparkle/star animations
  const sparkles = [
    { x: -350, y: -80, delay: 30, size: 24 },
    { x: 380, y: -60, delay: 35, size: 20 },
    { x: -280, y: 100, delay: 40, size: 18 },
    { x: 320, y: 90, delay: 45, size: 22 },
    { x: -150, y: -120, delay: 38, size: 16 },
    { x: 180, y: 130, delay: 42, size: 20 },
  ];

  // Animated decorative circles
  const circle1Scale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 50, stiffness: 80 },
  });
  const circle2Scale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 50, stiffness: 80 },
  });

  // Floating particles
  const particleY1 = Math.sin(frame * 0.1) * 20;
  const particleY2 = Math.cos(frame * 0.08) * 25;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity * sceneExit,
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `3px solid ${COLORS.coral}30`,
          transform: `scale(${circle1Scale})`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          border: `3px solid ${COLORS.teal}30`,
          transform: `scale(${circle2Scale})`,
          opacity: 0.5,
        }}
      />

      {/* Floating particles */}
      <div
        style={{
          position: "absolute",
          top: 150 + particleY1,
          left: 150,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: COLORS.coral,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 180 + particleY2,
          right: 180,
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: COLORS.teal,
          opacity: 0.3,
        }}
      />

      {/* Main text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* "And there's" */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
            opacity: text1Opacity,
            transform: `translateY(${text1Y}px)`,
          }}
        >
          And there's
        </div>

        {/* "even more" with emphasis */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: COLORS.teal,
            fontFamily,
            opacity: text2Opacity,
            transform: `translateY(${text2Y}px) scale(${text2Scale})`,
            textShadow: `0 0 40px ${COLORS.teal}40`,
          }}
        >
          even more
        </div>
      </div>

      {/* Sparkle stars */}
      {sparkles.map((sparkle, i) => {
        const sparkleProgress = interpolate(
          frame,
          [sparkle.delay, sparkle.delay + 15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const sparkleScale = interpolate(sparkleProgress, [0, 0.5, 1], [0, 1.2, 1]);
        const sparkleOpacity = interpolate(sparkleProgress, [0, 0.3, 1], [0, 1, 0.8]);
        const sparkleRotate = interpolate(frame, [sparkle.delay, sparkle.delay + 30], [0, 45]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              marginLeft: sparkle.x,
              marginTop: sparkle.y,
              fontSize: sparkle.size,
              transform: `scale(${sparkleScale}) rotate(${sparkleRotate}deg)`,
              opacity: sparkleOpacity,
              color: i % 2 === 0 ? COLORS.coral : COLORS.teal,
            }}
          >
            ✦
          </div>
        );
      })}

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 30,
          left: 60,
          width: 120,
          height: "auto",
          opacity: 0.7,
        }}
      />
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
        gap: 30,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 450,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <div
          style={{
            fontSize: 56,
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
            fontSize: 56,
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
          fontSize: 28,
          fontWeight: 700,
          padding: "18px 50px",
          borderRadius: 50,
          transform: `scale(${pulse})`,
          fontFamily,
          opacity: buttonOpacity,
          marginTop: 20,
        }}
      >
        Start Planning Free
      </div>

      <div
        style={{
          fontSize: 22,
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
