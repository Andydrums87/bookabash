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

export const AppDemoVertical: React.FC = () => {
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
        <VideoSceneVertical
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
        <VideoSceneVertical
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
        <VideoSceneVertical
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
        <VideoSceneVertical
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
        <VideoSceneVertical
          videoSrc={staticFile("demo-video/add suppliers.MP4")}
          frame={frame - 705}
          fps={fps}
          titleStart="Add "
          titleHighlight="any"
          titleEnd=" supplier"
          playbackRate={1.5}
        />
      </Sequence>

      {/* Scene 7: Three screens - Invites, RSVPs, Gift Registry (945-1095 frames / 31.5-36.5 sec) */}
      <Sequence from={945} durationInFrames={150}>
        <ThreePhoneScene
          frame={frame - 945}
          fps={fps}
          titleStart="Invites, RSVPs & gifts "
          titleHighlight="sorted"
          screens={[
            { image: staticFile("demo-video/invites-screen.png"), label: "E-Invites" },
            { image: staticFile("demo-video/rsvps-screen.png"), label: "RSVPs" },
            { image: staticFile("demo-video/gifts-screen.png"), label: "Gift Registry" },
          ]}
        />
      </Sequence>

      {/* Scene 8: CTA (1095-1230 frames / 36.5-41 sec) */}
      <Sequence from={1095} durationInFrames={135}>
        <CTAScene frame={frame - 1095} fps={fps} />
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
          width: 700,
          height: "auto",
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          fontSize: 40,
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

const VideoSceneVertical: React.FC<{
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

  const translateY = interpolate(slideIn, [0, 1], [80, 0]);
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
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Text overlay at top */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textOpacity,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.dark,
            fontFamily,
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
                height: 10,
                backgroundColor: COLORS.coral,
                borderRadius: 5,
              }}
            />
          </span>
          {titleEnd}
        </div>
      </div>

      {/* Phone mockup */}
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          marginTop: 60,
          position: "relative",
        }}
      >
        {/* Phone frame - dark bezel */}
        <div
          style={{
            width: 680,
            height: 1390,
            backgroundColor: "#1a1a1a",
            borderRadius: 80,
            padding: 16,
            boxShadow: "0 30px 100px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          {/* Side buttons - left */}
          <div
            style={{
              position: "absolute",
              left: -5,
              top: 200,
              width: 5,
              height: 55,
              backgroundColor: "#2a2a2a",
              borderRadius: "5px 0 0 5px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -5,
              top: 290,
              width: 5,
              height: 95,
              backgroundColor: "#2a2a2a",
              borderRadius: "5px 0 0 5px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -5,
              top: 420,
              width: 5,
              height: 95,
              backgroundColor: "#2a2a2a",
              borderRadius: "5px 0 0 5px",
            }}
          />
          {/* Side button - right */}
          <div
            style={{
              position: "absolute",
              right: -5,
              top: 330,
              width: 5,
              height: 130,
              backgroundColor: "#2a2a2a",
              borderRadius: "0 5px 5px 0",
            }}
          />

          {/* Screen */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 65,
              overflow: "hidden",
              backgroundColor: COLORS.white,
              position: "relative",
            }}
          >
            {/* Dynamic Island / Notch */}
            <div
              style={{
                position: "absolute",
                top: 18,
                left: "50%",
                transform: "translateX(-50%)",
                width: 170,
                height: 50,
                backgroundColor: "#1a1a1a",
                borderRadius: 28,
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

      {/* Logo at bottom */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 50,
          left: 40,
          width: 180,
          height: "auto",
        }}
      />
    </AbsoluteFill>
  );
};

const ThreePhoneScene: React.FC<{
  frame: number;
  fps: number;
  titleStart: string;
  titleHighlight: string;
  screens: Array<{ image: string; label: string }>;
}> = ({ frame, fps, titleStart, titleHighlight, screens }) => {
  const textOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const underlineWidth = interpolate(frame, [20, 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered phone animations
  const phone1Spring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 80, stiffness: 150 },
  });
  const phone2Spring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 80, stiffness: 150 },
  });
  const phone3Spring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const phoneAnimations = [phone1Spring, phone2Spring, phone3Spring];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: COLORS.white,
      }}
    >
      {/* Text overlay at top */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textOpacity,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: COLORS.dark,
            fontFamily,
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
                height: 10,
                backgroundColor: COLORS.coral,
                borderRadius: 5,
              }}
            />
          </span>
        </div>
      </div>

      {/* Three phones side by side */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 30,
          marginTop: 100,
        }}
      >
        {screens.map((screen, index) => {
          const animProgress = phoneAnimations[index];
          const translateY = interpolate(animProgress, [0, 1], [100, 0]);
          const opacity = interpolate(animProgress, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          });
          // Middle phone slightly larger and higher
          const isMiddle = index === 1;
          const scale = isMiddle ? 1 : 0.85;
          const yOffset = isMiddle ? -20 : 0;

          return (
            <div
              key={index}
              style={{
                transform: `translateY(${translateY + yOffset}px) scale(${scale})`,
                opacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 15,
              }}
            >
              {/* Phone frame */}
              <div
                style={{
                  width: 280,
                  height: 570,
                  backgroundColor: "#1a1a1a",
                  borderRadius: 40,
                  padding: 8,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                  position: "relative",
                }}
              >
                {/* Screen */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 32,
                    overflow: "hidden",
                    backgroundColor: COLORS.white,
                    position: "relative",
                  }}
                >
                  {/* Dynamic Island */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 80,
                      height: 26,
                      backgroundColor: "#1a1a1a",
                      borderRadius: 14,
                      zIndex: 10,
                    }}
                  />
                  {/* Screen image */}
                  <Img
                    src={screen.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              {/* Label below phone */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.dark,
                  fontFamily,
                  opacity: interpolate(animProgress, [0.5, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {screen.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logo at bottom */}
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 50,
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
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
        padding: 50,
      }}
    >
      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          width: 550,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center" }}>
        <AnimatedHeadline frame={frame} fps={fps} delay={5} color={COLORS.dark} size={56}>
          Less organising.
        </AnimatedHeadline>
        <AnimatedHeadline frame={frame} fps={fps} delay={15} color={COLORS.dark} size={56}>
          More celebrating.
        </AnimatedHeadline>
      </div>

      <div
        style={{
          backgroundColor: COLORS.coral,
          color: COLORS.white,
          fontSize: 36,
          fontWeight: 700,
          padding: "20px 50px",
          borderRadius: 50,
          transform: `scale(${scale * pulse})`,
          fontFamily,
          opacity: interpolate(frame - 25, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Start Planning Free
      </div>

      <div
        style={{
          fontSize: 28,
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
}> = ({ children, frame, fps, delay = 0, color = COLORS.dark, size = 64 }) => {
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
        transform: `translateY(${interpolate(y, [0, 1], [30, 0])}px)`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
};
