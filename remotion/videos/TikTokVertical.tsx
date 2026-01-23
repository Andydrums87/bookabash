import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";

const COLORS = {
  coral: "#F87B5E",
  coralLight: "#FFF0ED",
  dark: "#1a1a2e",
  white: "#FFFFFF",
};

export const TikTokVertical: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
      {/* Scene 1: Hook - Problem */}
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <AnimatedHeadline frame={frame} fps={fps} delay={0}>
              {"Kids' parties"}
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame} fps={fps} delay={10}>
              are <UnderlinedText frame={frame} delay={25}>stressful.</UnderlinedText>
            </AnimatedHeadline>
          </div>

          {/* Logo in corner */}
          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 80,
              left: 40,
              width: 200,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Snappy appears */}
      <Sequence from={75} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.coral,
          }}
        >
          <SnappyReveal frame={frame - 75} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Solution */}
      <Sequence from={135} durationInFrames={75}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <AnimatedHeadline frame={frame - 135} fps={fps} delay={0}>
              {"Kids' parties."}
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 135} fps={fps} delay={10}>
              Without the
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 135} fps={fps} delay={20}>
              chaos.
            </AnimatedHeadline>
          </div>

          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 80,
              left: 40,
              width: 200,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Value prop */}
      <Sequence from={210} durationInFrames={75}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <AnimatedHeadline frame={frame - 210} fps={fps} delay={0}>
              One place.
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 210} fps={fps} delay={10}>
              All the
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 210} fps={fps} delay={20}>
              party bits.
            </AnimatedHeadline>
          </div>

          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 80,
              left: 40,
              width: 200,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: CTA with background */}
      <Sequence from={285} durationInFrames={75}>
        <AbsoluteFill>
          <Img
            src={staticFile("demo-video/2.png")}
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
              padding: 60,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <AnimatedHeadline frame={frame - 285} fps={fps} delay={0}>
              Less organising.
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 285} fps={fps} delay={10}>
              More <UnderlinedText frame={frame - 285} delay={20}>celebrating.</UnderlinedText>
            </AnimatedHeadline>
          </div>

          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 80,
              left: 40,
              width: 200,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const AnimatedHeadline: React.FC<{
  children: React.ReactNode;
  frame: number;
  fps: number;
  delay?: number;
}> = ({ children, frame, fps, delay = 0 }) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const translateY = interpolate(y, [0, 1], [40, 0]);

  return (
    <div
      style={{
        fontSize: 82,
        fontWeight: 900,
        color: COLORS.dark,
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
        transform: `translateY(${translateY}px)`,
        lineHeight: 1.1,
      }}
    >
      {children}
    </div>
  );
};

const UnderlinedText: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const width = interpolate(frame - delay, [0, 20], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: 0,
          width: `${width}%`,
          height: 8,
          backgroundColor: COLORS.coral,
          borderRadius: 4,
        }}
      />
    </span>
  );
};

const SnappyReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
    from: 0,
    to: 1,
  });

  const bounce = spring({
    frame: frame - 20,
    fps,
    config: { damping: 30, stiffness: 300 },
  });

  const rotation = interpolate(bounce, [0, 1], [-5, 5]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
      }}
    >
      <Img
        src={staticFile("demo-video/Mascot Only (2).png")}
        style={{
          width: 500,
          height: "auto",
          transform: `scale(${scale}) rotate(${rotation}deg)`,
        }}
      />
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Meet Snappy!
      </div>
    </div>
  );
};
