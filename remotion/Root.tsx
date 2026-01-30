import { Composition } from "remotion";
import { PromoVideo } from "./PromoVideo";
import { TikTokVertical } from "./videos/TikTokVertical";
import { InstagramStory } from "./videos/InstagramStory";
import { YouTubeAd } from "./videos/YouTubeAd";
import { FeatureShowcase } from "./videos/FeatureShowcase";
import { CountdownTimer } from "./videos/CountdownTimer";
import { SupplierSpotlight } from "./videos/SupplierSpotlight";
import { TestimonialCarousel } from "./videos/TestimonialCarousel";
import { ThemeShowcase } from "./videos/ThemeShowcase";
import { HowItWorks } from "./videos/HowItWorks";
import { LogoAnimation } from "./videos/LogoAnimation";
import { AppDemo } from "./videos/AppDemo";
import { AppDemoVertical } from "./videos/AppDemoVertical";
import { InstagramGrid } from "./videos/InstagramGrid";
import { HomepageHero } from "./videos/HomepageHero";
import { HomepageHeroMobile } from "./videos/HomepageHeroMobile";
import { BlankScreen, CTAClip } from "./videos/BlankScreen";
import { LogoAnimationStory } from "./videos/LogoAnimationStory";
import { LogoAnimationStory2 } from "./videos/LogoAnimationStory2";
import { QuoteReel } from "./videos/QuoteReel";
import { QuoteReel2 } from "./videos/QuoteReel2";
import { ExpectationVsReality } from "./videos/ExpectationVsReality";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Promo Video - 25 seconds */}
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* TikTok/Reels Vertical - 9 seconds */}
      <Composition
        id="TikTokVertical"
        component={TikTokVertical}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Instagram Story - 15 seconds */}
      <Composition
        id="InstagramStory"
        component={InstagramStory}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* YouTube Pre-roll Ad - 18 seconds */}
      <Composition
        id="YouTubeAd"
        component={YouTubeAd}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Feature Showcase - 23 seconds */}
      <Composition
        id="FeatureShowcase"
        component={FeatureShowcase}
        durationInFrames={690}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Countdown Timer Intro - 15 seconds */}
      <Composition
        id="CountdownTimer"
        component={CountdownTimer}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Supplier Spotlight - 25 seconds */}
      <Composition
        id="SupplierSpotlight"
        component={SupplierSpotlight}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Testimonial Carousel - 24 seconds */}
      <Composition
        id="TestimonialCarousel"
        component={TestimonialCarousel}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Theme Showcase - 29 seconds */}
      <Composition
        id="ThemeShowcase"
        component={ThemeShowcase}
        durationInFrames={870}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* How It Works - 23 seconds */}
      <Composition
        id="HowItWorks"
        component={HowItWorks}
        durationInFrames={690}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Logo Animation - 10 seconds */}
      <Composition
        id="LogoAnimation"
        component={LogoAnimation}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* App Demo - 30 seconds (horizontal) */}
      <Composition
        id="AppDemo"
        component={AppDemo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* App Demo Vertical - 36 seconds (TikTok/Reels) */}
      <Composition
        id="AppDemoVertical"
        component={AppDemoVertical}
        durationInFrames={1080}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Instagram Grid - 36 seconds (Square) */}
      <Composition
        id="InstagramGrid"
        component={InstagramGrid}
        durationInFrames={1080}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* Homepage Hero - 80.8 seconds (Desktop) */}
      <Composition
        id="HomepageHero"
        component={HomepageHero}
        durationInFrames={2425}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Homepage Hero Mobile - 77 seconds (Vertical/Mobile) */}
      <Composition
        id="HomepageHeroMobile"
        component={HomepageHeroMobile}
        durationInFrames={2322}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Blank Screen - 2 seconds (for Canva editing) */}
      <Composition
        id="BlankScreen"
        component={BlankScreen}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* CTA Clip - 4 seconds (for Canva editing) */}
      <Composition
        id="CTAClip"
        component={CTAClip}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Logo Animation Story - 10 seconds (Instagram Story vertical) */}
      <Composition
        id="LogoAnimationStory"
        component={LogoAnimationStory}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Logo Animation Story 2 - Croc gets knocked (Instagram Story vertical) */}
      <Composition
        id="LogoAnimationStory2"
        component={LogoAnimationStory2}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Quote Reel - Text-led Instagram Reel (~13 seconds, 4 pages) */}
      <Composition
        id="QuoteReel"
        component={QuoteReel}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Quote Reel 2 - Orange background "Parenting is already a lot" (~8.5 seconds) */}
      <Composition
        id="QuoteReel2"
        component={QuoteReel2}
        durationInFrames={255}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Expectation vs Reality - Kids party planning (~17.5 seconds) */}
      <Composition
        id="ExpectationVsReality"
        component={ExpectationVsReality}
        durationInFrames={525}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
