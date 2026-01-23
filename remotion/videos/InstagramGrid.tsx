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
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const InstagramGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Background music - fixed volume, skip initial silence */}
      <Audio src={staticFile("demo-video/promo-448817.mp3")} volume={0.7} startFrom={60} />

      {/* Scene 1: Logo Animation (0-60 frames / 0-2 sec) */}
      <Sequence from={0} durationInFrames={60}>
        <LogoAnimationScene frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Form filling (60-240 frames / 2-8 sec) - sped up 1.5x, skip first 2s */}
      <Sequence from={60} durationInFrames={180}>
        <VideoSceneSquare
          videoSrc={staticFile("demo-video/formfilling.MP4")}
          frame={frame - 60}
          fps={fps}
          titleStart="Tell us about your "
          titleHighlight="party"
          playbackRate={1.5}
          startFrom={60}
        />
      </Sequence>

      {/* Scene 3: Loading (240-300 frames / 8-10 sec) - sped up 1.5x */}
      <Sequence from={240} durationInFrames={60}>
        <VideoSceneSquare
          videoSrc={staticFile("demo-video/loading.MP4")}
          frame={frame - 240}
          fps={fps}
          titleStart="Snappy finds your "
          titleHighlight="matches"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 4: Dashboard (300-420 frames / 10-14 sec) - sped up 1.5x */}
      <Sequence from={300} durationInFrames={120}>
        <VideoSceneSquare
          videoSrc={staticFile("demo-video/dashoard.MP4")}
          frame={frame - 300}
          fps={fps}
          titleStart="Everything in "
          titleHighlight="one place"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 5: Dashboard Suppliers (420-705 frames / 14-23.5 sec) - sped up 1.5x, skip first 3s */}
      <Sequence from={420} durationInFrames={285}>
        <VideoSceneSquare
          videoSrc={staticFile("demo-video/dashboard-suppliers.MP4")}
          frame={frame - 420}
          fps={fps}
          titleStart="View and customize your "
          titleHighlight="suppliers"
          playbackRate={1.5}
          startFrom={90}
        />
      </Sequence>

      {/* Scene 6: Add Suppliers (705-945 frames / 23.5-31.5 sec) - sped up 1.5x, full video */}
      <Sequence from={705} durationInFrames={240}>
        <VideoSceneSquare
          videoSrc={staticFile("demo-video/add suppliers.MP4")}
          frame={frame - 705}
          fps={fps}
          titleStart="Add "
          titleHighlight="any"
          titleEnd=" supplier"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 7: CTA (945-1080 frames / 31.5-36 sec) */}
      <Sequence from={945} durationInFrames={135}>
        <CTAScene frame={frame - 945} fps={fps} />
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
        gap: 20,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 500,
          height: "auto",
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: COLORS.dark,
          fontFamily,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        Party planning made easy
      </div>
    </AbsoluteFill>
  );
};

const VideoSceneSquare: React.FC<{
  videoSrc: string;
  frame: number;
  fps: number;
  titleStart: string;
  titleHighlight: string;
  titleEnd?: string;
  playbackRate?: number;
  startFrom?: number;
}> = ({ videoSrc, frame, fps, titleStart, titleHighlight, titleEnd = "", playbackRate = 1, startFrom = 0 }) => {
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const translateX = interpolate(slideIn, [0, 1], [50, 0]);
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const underlineWidth = interpolate(frame, [20, 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 50,
      }}
    >
      {/* Text on left side */}
      <div
        style={{
          flex: 1,
          opacity: textOpacity,
          paddingRight: 30,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: COLORS.dark,
            fontFamily,
            lineHeight: 1.1,
          }}
        >
          {titleStart}
          <span style={{ position: "relative", display: "inline-block" }}>
            {titleHighlight}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: 0,
                width: `${underlineWidth}%`,
                height: 8,
                backgroundColor: COLORS.coral,
                borderRadius: 4,
              }}
            />
          </span>
          {titleEnd}
        </div>
      </div>

      {/* Phone mockup on right side */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          opacity,
          position: "relative",
        }}
      >
        {/* Phone frame - dark bezel - scaled for side layout */}
        <div
          style={{
            width: 380,
            height: 780,
            backgroundColor: "#1a1a1a",
            borderRadius: 45,
            padding: 9,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          {/* Side buttons - left */}
          <div
            style={{
              position: "absolute",
              left: -4,
              top: 120,
              width: 4,
              height: 30,
              backgroundColor: "#2a2a2a",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -4,
              top: 165,
              width: 4,
              height: 55,
              backgroundColor: "#2a2a2a",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -4,
              top: 235,
              width: 4,
              height: 55,
              backgroundColor: "#2a2a2a",
              borderRadius: "4px 0 0 4px",
            }}
          />
          {/* Side button - right */}
          <div
            style={{
              position: "absolute",
              right: -4,
              top: 190,
              width: 4,
              height: 70,
              backgroundColor: "#2a2a2a",
              borderRadius: "0 4px 4px 0",
            }}
          />

          {/* Screen */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 38,
              overflow: "hidden",
              backgroundColor: COLORS.white,
              position: "relative",
            }}
          >
            {/* Dynamic Island / Notch */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 100,
                height: 28,
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                zIndex: 10,
              }}
            />

            {/* Video content */}
            <OffthreadVideo
              src={videoSrc}
              playbackRate={playbackRate}
              startFrom={startFrom}
              volume={0}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>

      {/* Logo at bottom left */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 25,
          left: 40,
          width: 130,
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
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 25,
        padding: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 380,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center" }}>
        <AnimatedHeadline frame={frame} fps={fps} delay={5} color={COLORS.dark} size={38}>
          Less organising.
        </AnimatedHeadline>
        <AnimatedHeadline frame={frame} fps={fps} delay={15} color={COLORS.dark} size={38}>
          More celebrating.
        </AnimatedHeadline>
      </div>

      <div
        style={{
          backgroundColor: COLORS.coral,
          color: COLORS.white,
          fontSize: 26,
          fontWeight: 700,
          padding: "14px 36px",
          borderRadius: 40,
          transform: `scale(${scale * pulse})`,
          fontFamily,
          opacity: interpolate(frame - 25, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Start Planning Free
      </div>

      <div
        style={{
          fontSize: 20,
          color: COLORS.dark,
          fontFamily,
          opacity: interpolate(frame - 35, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
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
  size?: number;
}> = ({ children, frame, fps, delay = 0, color = COLORS.dark, size = 42 }) => {
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
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
        transform: `translateY(${interpolate(y, [0, 1], [20, 0])}px)`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
};
