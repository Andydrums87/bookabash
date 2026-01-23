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
} from "remotion";

const COLORS = {
  coral: "#F87B5E",
  coralLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const AppDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Scene 1: Logo Animation (0-90 frames / 0-3 sec) */}
      <Sequence from={0} durationInFrames={90}>
        <LogoAnimationScene frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Form filling with overlay (90-270 frames / 3-9 sec) - sped up 1.5x, skip first 2s */}
      <Sequence from={90} durationInFrames={180}>
        <VideoScene
          videoSrc={staticFile("demo-video/formfilling.MP4")}
          frame={frame - 90}
          fps={fps}
          overlayText="Tell us about your party"
          subText="Date, theme, guests, location"
          playbackRate={1.5}
          startFrom={60}
        />
      </Sequence>

      {/* Scene 3: Loading (270-330 frames / 9-11 sec) - sped up 1.5x */}
      <Sequence from={270} durationInFrames={60}>
        <VideoScene
          videoSrc={staticFile("demo-video/loading.MP4")}
          frame={frame - 270}
          fps={fps}
          overlayText="Snappy finds your matches"
          subText="AI-powered supplier matching"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 4: Dashboard (330-510 frames / 11-17 sec) - sped up 1.5x */}
      <Sequence from={330} durationInFrames={180}>
        <VideoScene
          videoSrc={staticFile("demo-video/dashoard.MP4")}
          frame={frame - 330}
          fps={fps}
          overlayText="Everything in one place"
          subText="Book, message, and manage"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 5: CTA (510-900 frames / 17-30 sec) */}
      <Sequence from={510} durationInFrames={390}>
        <CTAScene frame={frame - 510} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const LogoAnimationScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
  });

  const textOpacity = interpolate(frame, [30, 50], [0, 1], {
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
          width: 600,
          height: "auto",
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          fontSize: 36,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          opacity: textOpacity,
        }}
      >
        Party planning made easy
      </div>
    </AbsoluteFill>
  );
};

const VideoScene: React.FC<{
  videoSrc: string;
  frame: number;
  fps: number;
  overlayText: string;
  subText: string;
  playbackRate?: number;
  startFrom?: number;
}> = ({ videoSrc, frame, fps, overlayText, subText, playbackRate = 1, startFrom = 0 }) => {
  // Phone frame slides in
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const translateY = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Text overlay animation
  const textOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Phone mockup with video */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        {/* Phone frame */}
        <div
          style={{
            width: 380,
            height: 780,
            backgroundColor: COLORS.dark,
            borderRadius: 50,
            padding: 12,
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 40,
              overflow: "hidden",
              backgroundColor: COLORS.white,
            }}
          >
            <OffthreadVideo
              src={videoSrc}
              playbackRate={playbackRate}
              startFrom={startFrom}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 30,
            backgroundColor: COLORS.dark,
            borderRadius: 20,
          }}
        />
      </div>

      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily: "system-ui, sans-serif",
            marginBottom: 10,
          }}
        >
          {overlayText}
        </div>
        <div
          style={{
            fontSize: 28,
            color: COLORS.dark,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.7,
          }}
        >
          {subText}
        </div>
      </div>

      {/* Logo */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 180,
          height: "auto",
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

  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.coral,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 500,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div
        style={{
          backgroundColor: COLORS.white,
          color: COLORS.coral,
          fontSize: 36,
          fontWeight: 700,
          padding: "20px 50px",
          borderRadius: 50,
          transform: `scale(${scale * pulse})`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Start Planning Free
      </div>

      <div
        style={{
          fontSize: 28,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame - 30, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Launching soon in St Albans
      </div>
    </AbsoluteFill>
  );
};

const AnimatedHeadline: React.FC<{
  children: React.ReactNode;
  frame: number;
  fps: number;
  delay?: number;
  color?: string;
}> = ({ children, frame, fps, delay = 0, color = COLORS.dark }) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  return (
    <div
      style={{
        fontSize: 64,
        fontWeight: 900,
        color,
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
        transform: `translateY(${interpolate(y, [0, 1], [30, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};
