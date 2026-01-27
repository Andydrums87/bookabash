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
  const baseWidth = screenWidth + 24;
  const lipWidth = baseWidth + 120;

  return (
    <div>
      <div
        style={{
          width: baseWidth,
          backgroundColor: "#1a1a1a",
          borderRadius: "16px 16px 0 0",
          padding: "12px 12px 0 12px",
          position: "relative",
        }}
      >
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
        <div
          style={{
            backgroundColor: "#000",
            borderRadius: "8px 8px 0 0",
            padding: 4,
            paddingBottom: 0,
          }}
        >
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
      <div
        style={{
          width: baseWidth,
          height: 12,
          background: "linear-gradient(180deg, #c4c4c4 0%, #e8e8e8 30%, #d4d4d4 100%)",
          borderRadius: "0 0 2px 2px",
          position: "relative",
        }}
      >
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
    <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
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

      {/* Step 1 Demo - Party Form with storytelling (430-670 frames / 14.3-22.3 sec) */}
      <Sequence from={430} durationInFrames={240}>
        <FormStoryScene
          frame={frame - 430}
          fps={fps}
          videoSrc="https://res.cloudinary.com/dghzq6xtd/video/upload/v1769550738/main_form_fill_rt5mrh.mp4"
          sceneDuration={240}
        />
      </Sequence>

      {/* Step 2 - Dashboard overview + card showcases (670-1090 frames / 22.3-36.3 sec) */}
      <Sequence from={670} durationInFrames={420}>
        <Step2StoryScene
          frame={frame - 670}
          fps={fps}
          sceneDuration={420}
        />
      </Sequence>

      {/* Dashboard video overlay - separate Sequence so video starts from frame 0 when visible */}
      {/* Starts at 670 (scene start) + 60 (dashboardStart) = 730, ends at 670 + 190 = 860 */}
      <Sequence from={730} durationInFrames={130}>
        <DashboardVideoOverlay sceneFrame={frame - 670} fps={fps} />
      </Sequence>

      {/* Step 3 Demo - Plan Actions Showcase: View, Add, Customize, Remove (1090-1765 frames / 36.3-58.8 sec) */}
      {/* Each action: 25 frame intro card + ~144 frame video = ~169 frames × 4 = 675 frames total (cut 1.5s) */}
      <Sequence from={1090} durationInFrames={675}>
        <PlanActionsShowcase
          frame={frame - 1090}
          fps={fps}
          sceneDuration={675}
        />
      </Sequence>

      {/* Features Intro - "And there's even more" (1765-1855 frames / 58.8-61.8 sec) */}
      <Sequence from={1765} durationInFrames={90}>
        <FeaturesIntroScene frame={frame - 1765} fps={fps} />
      </Sequence>

      {/* Create Invites (1855-2005 frames / 61.8-66.8 sec) */}
      <Sequence from={1855} durationInFrames={150}>
        <FeatureShowcaseScene
          frame={frame - 1855}
          fps={fps}
          videoSrc="https://res.cloudinary.com/dghzq6xtd/video/upload/v1769556182/invites_v8nonk.mp4"
          leadText="Create beautiful"
          slotWords={["invites", "designs", "memories"]}
          accentColor={COLORS.coral}
          sceneDuration={150}
        />
      </Sequence>

      {/* Gift Registry (2005-2155 frames / 66.8-71.8 sec) */}
      <Sequence from={2005} durationInFrames={150}>
        <FeatureShowcaseScene
          frame={frame - 2005}
          fps={fps}
          videoSrc={staticFile("hompagedemo/manage gift reg.mp4")}
          leadText="Build the perfect"
          slotWords={["wishlist", "registry", "gifts"]}
          accentColor={COLORS.teal}
          sceneDuration={150}
        />
      </Sequence>

      {/* Guest Management (2155-2305 frames / 71.8-76.8 sec) */}
      <Sequence from={2155} durationInFrames={150}>
        <FeatureShowcaseScene
          frame={frame - 2155}
          fps={fps}
          videoSrc="https://res.cloudinary.com/dghzq6xtd/video/upload/v1769555707/rsvp_adding_dqsksd.mp4"
          leadText="Track your"
          slotWords={["guests", "RSVPs", "responses"]}
          accentColor="#8B5CF6"
          sceneDuration={150}
        />
      </Sequence>

      {/* CTA (2305-2425 frames / 76.8-80.8 sec) */}
      <Sequence from={2305} durationInFrames={120}>
        <CTAScene frame={frame - 2305} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Step Intro Card - Big animated step number with title
const StepIntroScene: React.FC<{
  frame: number;
  fps: number;
  stepNumber: number;
  title: string;
  accentColor: string;
}> = ({ frame, fps, stepNumber, title, accentColor }) => {
  // Scene fade
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneExit = interpolate(frame, [45, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Step number animation - bounces in big
  const numberSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  });
  const numberScale = interpolate(numberSpring, [0, 1], [0, 1]);
  const numberY = interpolate(numberSpring, [0, 1], [100, 0]);

  // Title slides up
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 40, stiffness: 120 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
  const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative circles pulse
  const pulse = 1 + Math.sin(frame * 0.15) * 0.05;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity * sceneExit,
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `4px solid ${accentColor}20`,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          border: `4px solid ${accentColor}15`,
          transform: `scale(${pulse * 1.1})`,
        }}
      />

      {/* Big step number */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${numberScale}) translateY(${numberY}px)`,
            boxShadow: `0 20px 60px ${accentColor}50`,
          }}
        >
          <span
            style={{
              fontSize: 100,
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
            fontSize: 52,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            textAlign: "center",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            maxWidth: 800,
          }}
        >
          {title}
        </div>
      </div>

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          width: 140,
          height: "auto",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// Step 1 Storytelling Scene - Form filling with narrative text
const FormStoryScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  sceneDuration?: number;
}> = ({ frame, fps, videoSrc, sceneDuration = 240 }) => {
  // Scene fade in/out
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitStart = sceneDuration - 20;
  const sceneExit = interpolate(frame, [exitStart, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text animations - "Tell us the..." appears first
  const text1Spring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 40, stiffness: 120 },
  });
  const text1Y = interpolate(text1Spring, [0, 1], [60, 0]);
  const text1Opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Text fades out after all slot words have shown
  // Words: date(30), time(70), theme(110), guests(150), location(190)
  // Wait until location has shown for ~0.5s before fading
  const text1Exit = interpolate(frame, [205, 235], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slot machine words - cycle through these
  const slotWords = ["date", "time", "theme", "guests", "location"];
  const wordDuration = 40; // frames per word (~1.3s each, slower to match video)
  const slotStartFrame = 30;

  // Calculate which word is showing and its animation
  const slotFrame = frame - slotStartFrame;
  const currentWordIndex = Math.min(
    Math.floor(slotFrame / wordDuration),
    slotWords.length - 1
  );
  const wordProgress = (slotFrame % wordDuration) / wordDuration;

  // Each word slides up and out, next word slides in from below
  const getWordTransform = (index: number) => {
    if (index < currentWordIndex) {
      // Already passed - off screen above
      return { y: -160, opacity: 0 };
    } else if (index === currentWordIndex) {
      // Current word - animate out at the end of its duration
      const exitProgress = Math.max(0, (wordProgress - 0.7) / 0.3);
      return {
        y: interpolate(exitProgress, [0, 1], [0, -160]),
        opacity: interpolate(exitProgress, [0, 1], [1, 0]),
      };
    } else if (index === currentWordIndex + 1) {
      // Next word - animate in at the end of current word's duration
      const enterProgress = Math.max(0, (wordProgress - 0.7) / 0.3);
      return {
        y: interpolate(enterProgress, [0, 1], [160, 0]),
        opacity: interpolate(enterProgress, [0, 1], [0, 1]),
      };
    } else {
      // Future words - hidden below
      return { y: 160, opacity: 0 };
    }
  };

  // Video slides in from right
  const videoSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 35, stiffness: 80, mass: 1 },
  });
  const videoX = interpolate(videoSpring, [0, 1], [200, 0]);
  const videoOpacity = interpolate(videoSpring, [0, 1], [0, 1]);
  const videoScale = interpolate(videoSpring, [0, 1], [0.9, 1]);

  // Subtle 3D rotation
  const rotateY = interpolate(frame, [25, sceneDuration], [8, 2]);
  const floatY = Math.sin(frame * 0.04) * 6;

  // Final text - "Then one click" appears after slot words fade out
  const text3Spring = spring({
    frame: frame - 210,
    fps,
    config: { damping: 30, stiffness: 100 },
  });
  const text3Scale = interpolate(text3Spring, [0, 1], [0.8, 1]);
  const text3Opacity = interpolate(frame, [210, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse effect on final text
  const pulse = 1 + Math.sin((frame - 180) * 0.15) * 0.03;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        perspective: 1200,
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 70% 50%, ${COLORS.coral}12 0%, transparent 50%)`,
        }}
      />

      {/* Left side - Narrative text */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 0,
          bottom: 0,
          width: "45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* "Tell us the [slot]" - with slot machine word cycling */}
        <div
          style={{
            opacity: text1Opacity * text1Exit,
            transform: `translateY(${text1Y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              color: COLORS.dark,
              fontFamily,
              lineHeight: 1.05,
              letterSpacing: -4,
            }}
          >
            Tell us the
          </div>
          {/* Slot machine container */}
          <div
            style={{
              height: 160,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {slotWords.map((word, index) => {
              const transform = getWordTransform(index);
              return (
                <div
                  key={word}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    fontSize: 140,
                    fontWeight: 900,
                    color: COLORS.coral,
                    fontFamily,
                    lineHeight: 1.05,
                    letterSpacing: -4,
                    transform: `translateY(${transform.y}px)`,
                    opacity: transform.opacity,
                  }}
                >
                  {word}
                </div>
              );
            })}
          </div>
        </div>

        {/* "Then one click..." */}
        <div
          style={{
            opacity: text3Opacity,
            transform: `scale(${text3Scale * pulse})`,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              color: COLORS.teal,
              fontFamily,
              textShadow: `0 0 40px ${COLORS.teal}30`,
            }}
          >
            Then one click...
          </div>
        </div>
      </div>

      {/* Right side - Video */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "50%",
          transform: `
            translateY(-50%)
            translateX(${videoX}px)
            translateY(${floatY}px)
            scale(${videoScale})
            rotateY(${-rotateY}deg)
          `,
          opacity: videoOpacity,
          transformStyle: "preserve-3d",
          height: "88%",
          maxHeight: 950,
        }}
      >
        {/* Shadow */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "5%",
            right: "5%",
            bottom: -20,
            background: "rgba(0,0,0,0.2)",
            filter: "blur(40px)",
            borderRadius: 24,
            transform: "translateZ(-50px)",
          }}
        />

        {/* Video */}
        <OffthreadVideo
          src={videoSrc}
          volume={0}
          style={{
            height: "100%",
            width: "auto",
            borderRadius: 20,
            boxShadow: `
              0 30px 60px rgba(0,0,0,0.15),
              0 15px 30px rgba(0,0,0,0.1),
              0 0 0 1px rgba(0,0,0,0.05)
            `,
          }}
        />
      </div>

      {/* Step indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          opacity: interpolate(frame, [40, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            style={{
              width: num === 1 ? 40 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: num === 1 ? COLORS.coral : "#ddd",
            }}
          />
        ))}
      </div>

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          left: 80,
          width: 120,
          height: "auto",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

// Dashboard Video Overlay - renders the video in a separate Sequence so it starts from frame 0
const DashboardVideoOverlay: React.FC<{
  sceneFrame: number;
  fps: number;
}> = ({ sceneFrame, fps }) => {
  // sceneFrame is the frame relative to Step2StoryScene start (670)
  // This component renders in a Sequence starting at frame 730 (scene frame 60)
  // So when this renders, sceneFrame will be 60+

  const dashboardStart = 60;

  // Calculate animations based on scene frame
  const easedZoom = spring({
    frame: sceneFrame - dashboardStart,
    fps,
    config: { damping: 25, stiffness: 50, mass: 1.5 },
  });

  const dashboardScale = interpolate(easedZoom, [0, 1], [0.15, 1.15]);
  const dashboardY = interpolate(easedZoom, [0, 1], [400, -20]);
  const dashboardRotateX = interpolate(easedZoom, [0, 1], [35, 0]);
  const dashboardFloat = easedZoom > 0.9 ? Math.sin(sceneFrame * 0.04) * 5 : 0;
  const dashboardBlur = interpolate(easedZoom, [0, 0.7, 1], [8, 2, 0]);

  const dashboardOpacity = interpolate(
    sceneFrame,
    [dashboardStart, dashboardStart + 15, 160, 180],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        perspective: 1500,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `
            translate(-50%, -50%)
            translateY(${dashboardY + dashboardFloat}px)
            scale(${dashboardScale})
            rotateX(${dashboardRotateX}deg)
          `,
          opacity: dashboardOpacity,
          transformStyle: "preserve-3d",
          width: "95%",
          maxWidth: 1600,
          filter: dashboardBlur > 0.5 ? `blur(${dashboardBlur}px)` : "none",
        }}
      >
        {/* Dramatic shadow that grows with scale */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "5%",
            right: "5%",
            bottom: -40,
            background: `rgba(0,0,0,${0.1 + easedZoom * 0.2})`,
            filter: `blur(${40 + easedZoom * 30}px)`,
            borderRadius: 30,
            transform: "translateZ(-100px)",
          }}
        />

        {/* Glow effect behind video */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "120%",
            height: "120%",
            background: `radial-gradient(ellipse, ${COLORS.coral}30 0%, transparent 60%)`,
            transform: "translate(-50%, -50%) translateZ(-150px)",
            opacity: easedZoom * 0.6,
          }}
        />

        {/* Video - starts from frame 0 because it's in its own Sequence */}
        <OffthreadVideo
          src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1769551889/dashboard_look_gs6dnx.mp4"
          volume={0}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 20,
            boxShadow: `
              0 ${40 + easedZoom * 40}px ${80 + easedZoom * 40}px rgba(0,0,0,0.2),
              0 ${20 + easedZoom * 20}px ${40 + easedZoom * 20}px rgba(0,0,0,0.15),
              0 0 0 1px rgba(0,0,0,0.05)
            `,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Step 2 Story Scene - Dashboard overview + individual card showcases
const Step2StoryScene: React.FC<{
  frame: number;
  fps: number;
  sceneDuration?: number;
}> = ({ frame, fps, sceneDuration = 500 }) => {
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

  // Phase 1: "We build your perfect plan" headline (0-60 frames)
  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineExit = interpolate(frame, [50, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 40, stiffness: 100 },
  });
  const headlineY = interpolate(headlineSpring, [0, 1], [60, 0]);
  const headlineScale = interpolate(headlineSpring, [0, 1], [0.9, 1]);

  // Phase 2: Dashboard video is rendered in DashboardVideoOverlay (separate Sequence)
  // This ensures video starts from frame 0 when visible (at scene frame 60)

  // Phase 3: Individual card showcases (180-480 frames) - ~75 frames per card
  // Using full UI card screenshots from the dashboard
  const cards = [
    {
      name: "The Place",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769551860/Screenshot_2026-01-27_at_22.07.31_tj5uyj.png",
      color: COLORS.coral,
    },
    {
      name: "The Entertainment",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769551860/Screenshot_2026-01-27_at_22.07.35_jjewoz.png",
      color: COLORS.teal,
    },
    {
      name: "The Cake",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769551860/Screenshot_2026-01-27_at_22.07.43_l1yewy.png",
      color: "#FF9F43",
    },
    {
      name: "Party Bags",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769551859/Screenshot_2026-01-27_at_22.07.50_ivqeib.png",
      color: "#A855F7",
    },
  ];

  const cardStartFrame = 180;
  const cardDuration = 55; // frames per card (~1.8 sec each)

  // Calculate which card is currently showing
  const cardFrame = frame - cardStartFrame;
  const currentCardIndex = Math.floor(cardFrame / cardDuration);
  const localCardFrame = cardFrame % cardDuration;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        perspective: 1500,
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${COLORS.coral}15 0%, transparent 60%)`,
        }}
      />

      {/* Phase 1: Headline */}
      {frame < 80 && (
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
            opacity: headlineOpacity * headlineExit,
            transform: `translateY(${headlineY}px) scale(${headlineScale})`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: COLORS.dark,
              fontFamily,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            We build your
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: COLORS.coral,
              fontFamily,
              textAlign: "center",
              textShadow: `0 0 60px ${COLORS.coral}40`,
            }}
          >
            perfect plan
          </div>
        </div>
      )}

      {/* Phase 2: Dashboard video is rendered in DashboardVideoOverlay (separate Sequence layer) */}
      {/* This ensures the video starts from frame 0 when it becomes visible */}

      {/* Phase 3: Individual card showcases */}
      {frame >= cardStartFrame && currentCardIndex < cards.length && (
        <CardShowcase
          card={cards[currentCardIndex]}
          localFrame={localCardFrame}
          fps={fps}
          cardIndex={currentCardIndex}
        />
      )}

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          width: 120,
          height: "auto",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// Individual card showcase with fancy animations - shows full UI card screenshot
const CardShowcase: React.FC<{
  card: {
    name: string;
    image: string;
    color: string;
  };
  localFrame: number;
  fps: number;
  cardIndex: number;
}> = ({ card, localFrame, fps }) => {
  // Card entrance - 3D flip and scale
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });
  const cardScale = interpolate(entranceSpring, [0, 1], [0.3, 1]);
  const cardRotateY = interpolate(entranceSpring, [0, 1], [-90, 0]);
  const cardOpacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card exit - adjusted for shorter 55 frame duration
  const cardExit = interpolate(localFrame, [40, 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardExitScale = interpolate(localFrame, [40, 55], [1, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating motion
  const floatY = Math.sin(localFrame * 0.1) * 10;
  const floatRotate = Math.sin(localFrame * 0.08) * 2;

  // Decorative elements
  const ringScale = interpolate(entranceSpring, [0, 1], [0.5, 1.2]);
  const ringOpacity = interpolate(entranceSpring, [0, 0.5, 1], [0, 0.4, 0.15]);

  // Particle effects
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i * 45) * (Math.PI / 180),
    delay: i * 3,
    size: 8 + (i % 3) * 4,
  }));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1200,
      }}
    >
      {/* Decorative background ring */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `4px solid ${card.color}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => {
        const particleProgress = interpolate(
          localFrame,
          [p.delay, p.delay + 30],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const px = Math.cos(p.angle) * (200 + particleProgress * 250);
        const py = Math.sin(p.angle) * (200 + particleProgress * 250);
        const pOpacity = interpolate(particleProgress, [0, 0.3, 1], [0, 1, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: card.color,
              transform: `translate(${px}px, ${py}px)`,
              opacity: pOpacity * 0.6,
            }}
          />
        );
      })}

      {/* Main card container - centered */}
      <div
        style={{
          opacity: cardOpacity * cardExit,
          transform: `
            scale(${cardScale * cardExitScale})
            translateY(${floatY}px)
            rotateY(${cardRotateY}deg)
            rotate(${floatRotate}deg)
          `,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card shadow */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 30,
            right: -30,
            bottom: -40,
            background: "rgba(0,0,0,0.25)",
            filter: "blur(40px)",
            borderRadius: 30,
            transform: "translateZ(-50px)",
          }}
        />

        {/* Card image - full UI screenshot */}
        <Img
          src={card.image}
          style={{
            height: 750,
            width: "auto",
            borderRadius: 24,
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.2),
              0 20px 40px rgba(0,0,0,0.15),
              0 0 0 1px rgba(0,0,0,0.05)
            `,
          }}
        />

        {/* Glow effect behind card */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${card.color}50 0%, transparent 70%)`,
            transform: "translate(-50%, -50%) translateZ(-100px)",
            filter: "blur(50px)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Plan Actions Showcase - Quick intro cards + full-screen videos
const PlanActionsShowcase: React.FC<{
  frame: number;
  fps: number;
  sceneDuration?: number;
}> = ({ frame, fps, sceneDuration = 720 }) => {
  // Each action: 25 frame intro card + video duration
  const introCardFrames = 25; // ~0.8 seconds for intro card
  const actions = [
    {
      verb: "VIEW",
      subtitle: "your suppliers",
      video: "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769553836/view_supplier_uxkzps.mp4",
      color: COLORS.teal,
      videoDuration: 155, // actual video frames
    },
    {
      verb: "ADD",
      subtitle: "new suppliers",
      video: "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769553633/short_add_suppliers_r3z2xd.mp4",
      color: COLORS.coral,
      videoDuration: 155,
    },
    {
      verb: "CUSTOMIZE",
      subtitle: "your selections",
      video: "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769553950/customise_supplier_ewbg68.mp4",
      color: "#8B5CF6",
      videoDuration: 155,
    },
    {
      verb: "REMOVE",
      subtitle: "what you don't need",
      video: "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769553776/remove_supplier_qawmac.mp4",
      color: "#EF4444",
      videoDuration: 155,
    },
  ];

  // Calculate total duration for each action (intro + video)
  const getActionTotalDuration = (action: typeof actions[0]) => introCardFrames + action.videoDuration;

  // Calculate cumulative start frames for each action
  const actionStartFrames = actions.reduce((acc, action, i) => {
    if (i === 0) return [0];
    return [...acc, acc[i - 1] + getActionTotalDuration(actions[i - 1])];
  }, [] as number[]);

  // Find current action based on frame
  let currentActionIndex = 0;
  for (let i = 0; i < actions.length; i++) {
    if (frame >= actionStartFrames[i]) {
      currentActionIndex = i;
    }
  }
  currentActionIndex = Math.min(currentActionIndex, actions.length - 1);

  const currentAction = actions[currentActionIndex];
  const actionStartFrame = actionStartFrames[currentActionIndex];
  const localFrame = frame - actionStartFrame;
  const isShowingIntro = localFrame < introCardFrames;
  const videoLocalFrame = localFrame - introCardFrames;
  const actionTotalDuration = getActionTotalDuration(currentAction);

  // Scene fade in/out
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneExit = interpolate(frame, [sceneDuration - 15, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== INTRO CARD ANIMATIONS =====
  // Explosive scale-in for the verb
  const introVerbSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 300, mass: 0.5 },
  });
  const introVerbScale = interpolate(introVerbSpring, [0, 1], [3, 1]);
  const introVerbOpacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle slides up from below
  const introSubtitleSpring = spring({
    frame: localFrame - 5,
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.6 },
  });
  const introSubtitleY = interpolate(introSubtitleSpring, [0, 1], [40, 0]);
  const introSubtitleOpacity = interpolate(localFrame, [5, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card exit - quick zoom out
  const introExit = interpolate(localFrame, [introCardFrames - 8, introCardFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introExitScale = interpolate(localFrame, [introCardFrames - 8, introCardFrames], [1, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== VIDEO ANIMATIONS =====
  // Video entrance - zooms in from slightly scaled down
  const videoEntranceSpring = spring({
    frame: videoLocalFrame,
    fps,
    config: { damping: 20, stiffness: 150, mass: 0.8 },
  });
  const videoScale = interpolate(videoEntranceSpring, [0, 1], [0.95, 1]);
  const videoOpacity = interpolate(videoLocalFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Video exit
  const videoExitStart = currentAction.videoDuration - 15;
  const videoExit = interpolate(videoLocalFrame, [videoExitStart, currentAction.videoDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background color transitions with action
  const bgColor = currentAction.color + "15";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isShowingIntro ? currentAction.color : COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        overflow: "hidden",
      }}
    >
      {/* ===== INTRO CARD ===== */}
      {isShowingIntro && (
        <AbsoluteFill
          style={{
            opacity: introExit,
            transform: `scale(${introExitScale})`,
          }}
        >
          {/* Radial burst lines */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: interpolate(introVerbSpring, [0, 1], [0, 600]),
                background: `linear-gradient(to bottom, transparent, ${COLORS.white}30, transparent)`,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                opacity: interpolate(introVerbSpring, [0, 0.5, 1], [0, 0.6, 0]),
              }}
            />
          ))}

          {/* Giant verb */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -60%) scale(${introVerbScale})`,
              fontSize: 180,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily,
              letterSpacing: -8,
              opacity: introVerbOpacity,
              textShadow: `0 0 100px ${COLORS.white}50`,
            }}
          >
            {currentAction.verb}
          </div>

          {/* Subtitle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, 80px) translateY(${introSubtitleY}px)`,
              fontSize: 48,
              fontWeight: 600,
              color: COLORS.white,
              fontFamily,
              opacity: introSubtitleOpacity * 0.9,
              letterSpacing: 2,
            }}
          >
            {currentAction.subtitle}
          </div>

          {/* Step indicator */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 12,
            }}
          >
            {actions.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentActionIndex ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: i === currentActionIndex ? COLORS.white : `${COLORS.white}40`,
                  transition: "width 0.2s",
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ===== VIDEO ===== */}
      {!isShowingIntro && (
        <AbsoluteFill
          style={{
            opacity: videoOpacity * videoExit,
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1400,
              height: 1400,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${currentAction.color}20 0%, transparent 50%)`,
              filter: "blur(60px)",
            }}
          />

          {/* Full-width video container */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${videoScale})`,
              width: "95%",
              maxWidth: 1700,
            }}
          >
            {/* Shadow */}
            <div
              style={{
                position: "absolute",
                top: 50,
                left: "5%",
                right: "5%",
                bottom: -40,
                background: "rgba(0,0,0,0.2)",
                filter: "blur(50px)",
                borderRadius: 30,
              }}
            />

            {/* Video container */}
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: `
                  0 40px 80px rgba(0,0,0,0.15),
                  0 20px 40px rgba(0,0,0,0.1),
                  0 0 0 3px ${currentAction.color}30
                `,
              }}
            >
              {/* Render all videos but only show current one */}
              {actions.map((action, i) => (
                <div
                  key={action.verb}
                  style={{
                    display: i === currentActionIndex ? "block" : "none",
                  }}
                >
                  <Sequence from={actionStartFrames[i] + introCardFrames} layout="none">
                    <OffthreadVideo
                      src={action.video}
                      volume={0}
                      style={{
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  </Sequence>
                </div>
              ))}
            </div>
          </div>

          {/* Progress dots at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 12,
            }}
          >
            {actions.map((action, i) => (
              <div
                key={action.verb}
                style={{
                  width: i === currentActionIndex ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: i === currentActionIndex ? action.color : "#ddd",
                  boxShadow: i === currentActionIndex ? `0 4px 15px ${action.color}50` : "none",
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 50,
          width: 100,
          height: "auto",
          opacity: isShowingIntro ? 0.6 : 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

// Screen Studio-style floating 3D demo scene - warm background (for steps 2 & 3)
const ScreenStudioDemoScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  stepNumber: number;
  accentColor: string;
  sceneDuration?: number;
}> = ({ frame, fps, videoSrc, stepNumber, accentColor, sceneDuration = 240 }) => {
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

  // Floating entrance animation
  const floatSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 30, stiffness: 80, mass: 1.2 },
  });

  const translateY = interpolate(floatSpring, [0, 1], [120, 0]);
  const videoScale = interpolate(floatSpring, [0, 1], [0.85, 1]);
  const videoOpacity = interpolate(floatSpring, [0, 1], [0, 1]);

  // Subtle 3D rotation
  const rotateX = interpolate(floatSpring, [0, 1], [12, 4]);
  const rotateY = interpolate(frame, [0, sceneDuration], [-2, 2]);

  // Subtle floating motion
  const floatY = Math.sin(frame * 0.04) * 10;
  const floatRotate = Math.sin(frame * 0.025) * 0.8;

  // Progress dots
  const dotsOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        perspective: 1500,
      }}
    >
      {/* Subtle gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at center 30%, ${accentColor}10 0%, transparent 60%)`,
        }}
      />

      {/* Floating video - centered with 3D transforms */}
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
          width: "85%",
          maxWidth: 1400,
        }}
      >
        {/* Deep shadow for 3D depth */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "8%",
            right: "8%",
            bottom: -30,
            background: "rgba(0,0,0,0.2)",
            filter: "blur(50px)",
            borderRadius: 30,
            transform: "translateZ(-80px)",
          }}
        />

        {/* Video with rounded corners and shadow */}
        <OffthreadVideo
          src={videoSrc}
          volume={0}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 16,
            boxShadow: `
              0 30px 60px rgba(0,0,0,0.12),
              0 15px 30px rgba(0,0,0,0.08),
              0 0 0 1px rgba(0,0,0,0.05)
            `,
          }}
        />
      </div>

      {/* Progress dots at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
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
              width: num === stepNumber ? 40 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: num === stepNumber ? accentColor : "#ddd",
            }}
          />
        ))}
      </div>

      {/* Logo watermark */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          width: 120,
          height: "auto",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// Feature showcase scene - for invites, gift registry etc (slot machine style like Step 1)
const FeatureShowcaseScene: React.FC<{
  frame: number;
  fps: number;
  videoSrc: string;
  leadText: string;
  slotWords: string[];
  accentColor: string;
  sceneDuration?: number;
}> = ({ frame, fps, videoSrc, leadText, slotWords, accentColor, sceneDuration = 150 }) => {
  // Scene fade
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitStart = sceneDuration - 20;
  const sceneExit = interpolate(frame, [exitStart, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Video animation
  const videoSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 35, stiffness: 80 },
  });
  const videoScale = interpolate(videoSpring, [0, 1], [0.9, 1]);
  const videoY = interpolate(videoSpring, [0, 1], [40, 0]);

  // Text animation - lead text fades in first
  const leadTextSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 40, stiffness: 120 },
  });
  const leadTextY = interpolate(leadTextSpring, [0, 1], [60, 0]);
  const leadTextOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slot machine animation for single changing word (like FormStoryScene)
  const slotStartFrame = 30;
  const wordDuration = 30; // frames per word
  const slotFrame = Math.max(0, frame - slotStartFrame);
  const currentWordIndex = Math.min(
    Math.floor(slotFrame / wordDuration),
    slotWords.length - 1
  );
  const wordProgress = (slotFrame % wordDuration) / wordDuration;

  // Each word slides up and out, next word slides in from below
  const getWordTransform = (index: number) => {
    if (index < currentWordIndex) {
      // Already passed - off screen above
      return { y: -140, opacity: 0 };
    } else if (index === currentWordIndex) {
      // Current word - animate out at the end of its duration (unless it's the last word)
      if (index === slotWords.length - 1) {
        // Last word stays visible
        return { y: 0, opacity: 1 };
      }
      const exitProgress = Math.max(0, (wordProgress - 0.7) / 0.3);
      return {
        y: interpolate(exitProgress, [0, 1], [0, -140]),
        opacity: interpolate(exitProgress, [0, 1], [1, 0]),
      };
    } else if (index === currentWordIndex + 1) {
      // Next word - animate in at the end of current word's duration
      const enterProgress = Math.max(0, (wordProgress - 0.7) / 0.3);
      return {
        y: interpolate(enterProgress, [0, 1], [140, 0]),
        opacity: interpolate(enterProgress, [0, 1], [0, 1]),
      };
    } else {
      // Future words - hidden below
      return { y: 140, opacity: 0 };
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coralLight,
        opacity: sceneOpacity * sceneExit,
        overflow: "hidden",
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor}12 0%, transparent 50%)`,
        }}
      />

      {/* Left side - Lead text + slot machine word */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 0,
          bottom: 0,
          width: "40%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {/* Lead text (static) */}
        <div
          style={{
            opacity: leadTextOpacity,
            transform: `translateY(${leadTextY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: COLORS.dark,
              fontFamily,
              lineHeight: 1.05,
              letterSpacing: -4,
            }}
          >
            {leadText}
          </div>
        </div>

        {/* Slot machine container - single word cycles through */}
        <div
          style={{
            height: 140,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {slotWords.map((word, index) => {
            const transform = getWordTransform(index);
            return (
              <div
                key={word}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  fontSize: 120,
                  fontWeight: 900,
                  color: accentColor,
                  fontFamily,
                  lineHeight: 1.05,
                  letterSpacing: -4,
                  transform: `translateY(${transform.y}px)`,
                  opacity: transform.opacity,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side - Video in laptop */}
      <div
        style={{
          position: "absolute",
          right: 50,
          top: "50%",
          width: "55%",
          maxWidth: 950,
          transform: `translateY(-50%) translateY(${videoY}px) scale(${videoScale})`,
        }}
      >
        <LaptopMockup screenWidth={950} screenHeight={534}>
          <OffthreadVideo
            src={videoSrc}
            volume={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
            }}
          />
        </LaptopMockup>
      </div>

      {/* Logo */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 30,
          left: 80,
          width: 120,
          height: "auto",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

const StressedParentScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
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

  const sceneOpacity = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <OffthreadVideo
        src={staticFile("hompagedemo/output (15).mp4")}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

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
        backgroundColor: COLORS.coralLight,
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
  const burstProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstScale = interpolate(burstProgress, [0, 0.5, 1], [0, 3, 0]);
  const burstOpacity = interpolate(burstProgress, [0, 0.3, 1], [0, 0.8, 0]);

  const introducingText = "INTRODUCING";
  const letterDelay = 2;

  const textScaleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.5 },
  });
  const textScale = interpolate(textScaleSpring, [0, 1], [0.3, 1]);

  const introducingOpacity = interpolate(frame, [5, 12, 28, 38], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glitchOffset = frame > 8 && frame < 15 ? Math.sin(frame * 50) * 3 : 0;

  const gradientPosition = interpolate(frame, [5, 25], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rings = [
    { delay: 20, color: COLORS.coral },
    { delay: 25, color: COLORS.teal },
    { delay: 30, color: COLORS.coral },
  ];

  const logoDelay = 35;

  const logoScaleSpring = spring({
    frame: frame - logoDelay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.5 },
  });

  const logoRotation = interpolate(frame, [logoDelay, logoDelay + 15], [-5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoOpacity = interpolate(frame, [logoDelay, logoDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.5 + Math.sin(frame * 0.12) * 0.3;
  const shimmerOffset = (frame * 8) % 400;

  const subheadingDelay = 50;
  const subheadingWords = ["Book", "your", "party", "in", "a", "snap"];

  const exitProgress = interpolate(frame, [105, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.1]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

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
    </AbsoluteFill>
  );
};

const FeaturesIntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sceneExit = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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

  const sparkles = [
    { x: -350, y: -80, delay: 30, size: 24 },
    { x: 380, y: -60, delay: 35, size: 20 },
    { x: -280, y: 100, delay: 40, size: 18 },
    { x: 320, y: 90, delay: 45, size: 22 },
    { x: -150, y: -120, delay: 38, size: 16 },
    { x: 180, y: 130, delay: 42, size: 20 },
  ];

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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily,
            opacity: text1Opacity,
            transform: `translateY(${text1Y}px)`,
          }}
        >
          And there's
        </div>

        <div
          style={{
            fontSize: 100,
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

      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 30,
          left: 60,
          width: 120,
          height: "auto",
          opacity: 0.5,
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
        backgroundColor: COLORS.coralLight,
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
