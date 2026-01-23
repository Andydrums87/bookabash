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

export const InstagramStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.coralLight }}>
      {/* Scene 1: Hook */}
      <Sequence from={0} durationInFrames={90}>
        <SlideWithHeadline
          frame={frame}
          fps={fps}
          lines={["Party planning,"]}
          underlinedWord="simple"
          underlineDelay={30}
          extraLine="made simple"
        />
      </Sequence>

      {/* Scene 2: Problem */}
      <Sequence from={90} durationInFrames={90}>
        <SlideWithHeadline
          frame={frame - 90}
          fps={fps}
          lines={["No spreadsheets.", "No stress."]}
        />
      </Sequence>

      {/* Scene 3: Snappy intro */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.coral,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SnappyIntro frame={frame - 180} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Value prop with party background */}
      <Sequence from={270} durationInFrames={90}>
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
              padding: 50,
            }}
          >
            <AnimatedHeadline frame={frame - 270} fps={fps} delay={0}>
              {"Kids' parties."}
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 270} fps={fps} delay={10}>
              Sorted.
            </AnimatedHeadline>
            <div
              style={{
                fontSize: 32,
                color: COLORS.dark,
                fontFamily: "system-ui, sans-serif",
                marginTop: 20,
                opacity: interpolate(frame - 270 - 25, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              Launching soon in St Albans
            </div>
          </div>
          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 60,
              left: 40,
              width: 180,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: CTA */}
      <Sequence from={360} durationInFrames={90}>
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
              padding: 50,
            }}
          >
            <AnimatedHeadline frame={frame - 360} fps={fps} delay={0}>
              One booking.
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 360} fps={fps} delay={10}>
              Everything
            </AnimatedHeadline>
            <AnimatedHeadline frame={frame - 360} fps={fps} delay={20}>
              sorted.
            </AnimatedHeadline>
            <div
              style={{
                fontSize: 32,
                color: COLORS.dark,
                fontFamily: "system-ui, sans-serif",
                marginTop: 20,
                opacity: interpolate(frame - 360 - 35, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              Launching soon in St Albans
            </div>
          </div>
          <Img
            src={staticFile("demo-video/Transparent With Text (5).png")}
            style={{
              position: "absolute",
              bottom: 60,
              left: 40,
              width: 180,
              height: "auto",
            }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const SlideWithHeadline: React.FC<{
  frame: number;
  fps: number;
  lines: string[];
  underlinedWord?: string;
  underlineDelay?: number;
  extraLine?: string;
}> = ({ frame, fps, lines, underlinedWord, underlineDelay = 30, extraLine }) => {
  return (
    <AbsoluteFill
      style={{
        padding: 50,
        justifyContent: "flex-start",
        paddingTop: 180,
      }}
    >
      {lines.map((line, i) => (
        <AnimatedHeadline key={i} frame={frame} fps={fps} delay={i * 12}>
          {line}
        </AnimatedHeadline>
      ))}

      {extraLine && underlinedWord && (
        <AnimatedHeadline frame={frame} fps={fps} delay={lines.length * 12}>
          <UnderlinedText frame={frame} delay={underlineDelay}>
            {extraLine}
          </UnderlinedText>
        </AnimatedHeadline>
      )}

      <div
        style={{
          fontSize: 32,
          color: COLORS.dark,
          fontFamily: "system-ui, sans-serif",
          marginTop: 20,
          opacity: interpolate(frame - 40, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Party planning made easy
      </div>

      <Img
        src={staticFile("demo-video/Transparent With Text (5).png")}
        style={{
          position: "absolute",
          bottom: 60,
          left: 40,
          width: 180,
          height: "auto",
        }}
      />
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
        fontSize: 78,
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

const SnappyIntro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 200 },
  });

  const textOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
      }}
    >
      <Img
        src={staticFile("demo-video/Mascot Only (2).png")}
        style={{
          width: 450,
          height: "auto",
          transform: `scale(${scale})`,
        }}
      />
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: textOpacity,
        }}
      >
        PartySnap
      </div>
      <div
        style={{
          fontSize: 32,
          color: COLORS.white,
          fontFamily: "system-ui, sans-serif",
          opacity: textOpacity,
        }}
      >
        Party planning made easy
      </div>
    </div>
  );
};
