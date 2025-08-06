import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SupplierForm } from "@/components/supplier-form"
import {
  CheckCircle,
  Users,
  UserPlus,
  ClipboardList,
  CalendarCheck,
  BadgeDollarSign,
  Target,
  Settings2,
  Wrench,
  Star,
  ShieldCheck,
  Zap,
  Rocket,
  PlayCircle,
} from "lucide-react"

export default function SupplierOnboardingPage() {
  const whyPartnerBenefits = [
    {
      icon: Target,
      title: "Quality Leads, Zero Hassle",
      description:
        "Connect directly with motivated parents actively searching for your specific services, without wasting time on unqualified inquiries. Get targeted exposure to customers ready to book.",
    },
    {
      icon: Zap,
      title: "Streamlined Operations",
      description:
        "Our intuitive dashboard simplifies everything from availability management and communication to secure payments, freeing up your valuable time to focus on delivering amazing events.",
    },
    {
      icon: Rocket,
      title: "Accelerate Your Growth",
      description:
        "Expand your market reach, boost your visibility, and increase bookings with our targeted marketing, professional profiles, and fair commission model. Let us help you scale.",
    },
  ]

  const successStories = [
    {
      name: "Claire Rossi, Singer",
      title: "Professional Vocalist",
      quote:
        "I wanted to reach a wider audience and connect with people that would love my style of music. Poptop did that and so much more. Clients can book me instantly and know exactly what they're getting. And I can concentrate on doing what I love instead of spending half my life on my laptop!",
      imageSrc: "/placeholder.svg?width=600&height=400",
      storyLink: "#",
    },
    {
      name: "Chef Lopez, Private Chef",
      title: "Gourmet Catering",
      quote:
        "Poptop has been an incredible platform for generating new leads and has helped us learn a lot over the past year. Since being on the platform, we've grown our business and started offering lots of menus. The site is really easy to use as we're able to upload a variety of menus, unlike other listings sites.",
      imageSrc: "/placeholder.svg?width=600&height=400",
      storyLink: "#",
    },
  ]

    // Subtle dot pattern using primary colors for the final CTA background
    const ctaBackgroundPattern = `
    radial-gradient(circle at 1px 1px, hsl(var(--primary-300)) 1px, transparent 0),
    radial-gradient(circle at 10px 10px, hsl(var(--primary-200)) 1px, transparent 0)
  `
  const ctaBackgroundStyle = {
    backgroundImage: ctaBackgroundPattern,
    backgroundSize: "20px 20px",
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-850">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-6xl md:w-full w-[90%] mx-auto md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white eading-tight animate-fade-in">
                Transform your business with{" "}
                <span className="text-primary-600 dark:text-primary-400">PartySnap</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
                Our marketplace provides you with powerful tools to boost bookings and reduce admin – giving you time to
                focus on the craft you love.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white" asChild>
                  <Link href="#signup-form">List Your Business</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 text-gray-600 dark:text-gray-400">
                {/* <div className="flex items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">Excellent</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
                    ))}
                  </div>
                </div> */}
                {/* <span className="text-sm">
                  Based on <strong className="text-gray-800 dark:text-gray-200">1,200+ reviews</strong> on{" "}
                  <ShieldCheck className="inline w-4 h-4 text-green-500 mr-1" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">TrustPlatform</span>
                </span> */}
              </div>
            </div>
            <div>
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg"
                alt="Professional event supplier using BookABash"
                width={600}
                height={500}
                className="rounded-xl shadow-2xl mx-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Initial Form Section */}
      <section id="signup-form" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          {/* <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Become a BookABash Supplier
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Fill in your details to get started. It only takes a few minutes!
            </p>
          </div> */}
          <Card className="max-w-6xl mx-auto bg-gray-50 dark:bg-slate-850 shadow-xl border-gray-200 dark:border-slate-700 rounded-lg">
          <div className="max-w-3xl px-10 py-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Become a PartySnap Supplier
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Fill in your details to get started. It only takes a few minutes!
            </p>
          </div>
            <CardContent className="p-6 md:p-10">
              <SupplierForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Partner with BookABash? Section - 3 Big Cards */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Partner with <span className="text-primary-600 dark:text-primary-400">PartySnap</span>?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Unlock your business's full potential. We provide the platform, tools, and support to help you thrive in
              the competitive events industry.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {whyPartnerBenefits.map((item, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-slate-850 shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-2 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700"
              >
                <CardContent className="p-8 flex flex-col items-center text-center flex-grow">
                  <div className="mb-6 inline-flex items-center justify-center p-5 bg-primary-100 dark:bg-primary-700 rounded-full">
                    <item.icon className="w-12 h-12 text-primary-600 dark:text-primary-300" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-grow">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Getting Started is <span className="text-primary-600 dark:text-primary-400">Easy</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Join our network in a few simple steps and start connecting with customers today.
            </p>
          </div>
          <div className="relative">
            <div
              className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-primary-200 dark:bg-primary-700 transform -translate-y-1/2"
              style={{ zIndex: 0 }}
            ></div>
            <div className="grid md:grid-cols-4 gap-8 md:gap-0 relative" style={{ zIndex: 1 }}>
              {[
                {
                  icon: UserPlus,
                  title: "Quick Sign-Up",
                  description: "Register in minutes with your basic business information. No lengthy forms!",
                },
                {
                  icon: ClipboardList,
                  title: "Build Your Profile",
                  description: "Showcase your services, upload photos, set your prices, and define your coverage.",
                },
                {
                  icon: CalendarCheck,
                  title: "Manage Bookings",
                  description: "Receive instant notifications and effortlessly manage all your bookings in one place.",
                },
                {
                  icon: BadgeDollarSign,
                  title: "Get Paid & Grow",
                  description: "Delight customers, receive secure payments, and watch your business flourish.",
                },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center md:relative p-4">
                  {index < 3 && <div className="md:hidden w-0.5 h-8 bg-primary-200 dark:bg-primary-700 mb-4"></div>}
                  <div className="relative mb-4 z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary-500 text-white rounded-full shadow-lg border-4 border-white dark:border-slate-900">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 text-sm font-bold rounded-full border-2 border-white dark:border-slate-900">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Video Section - New */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              See <span className="text-primary-600 dark:text-primary-400">PartySnap</span> in Action
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Watch our short onboarding video to see how easy it is to get started and make the most of our platform.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg shadow-xl flex items-center justify-center">
              {/* Placeholder for video embed. Replace with actual iframe or video player */}
              <PlayCircle className="w-24 h-24 text-gray-400 dark:text-slate-500" />
              {/* Example iframe (commented out):
              <iframe 
                className="w-full h-full rounded-lg" 
                src="https://www.youtube.com/embed/your_video_id" 
                title="BookABash Onboarding Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
              */}
            </div>
          </div>
        </div>
      </section>

      {/* Transform Your Business Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Transform Your Business with <span className="text-primary-600 dark:text-primary-400">PartySnap</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Leverage our platform to streamline operations, reach new customers, and elevate your brand.
            </p>
          </div>
          {/* Row 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460292/ceyda-ciftci-Vj0qd6Uemdo-unsplash_bkuaas.jpg"
                alt="Supplier using BookABash tools"
                width={600}
                height={450}
                className="rounded-xl shadow-xl mx-auto"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-semibold flex items-center text-gray-900 dark:text-white">
                <Wrench className="w-7 h-7 mr-3 text-primary-600 dark:text-primary-400" />
                Powerful Tools at Your Fingertips
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our comprehensive toolkit is designed to simplify your workflow and maximize your efficiency.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {[
                  "Fully integrated calendar lets you easily manage your availability.",
                  "Unique Live Pricing system notifies you when a client wants to book.",
                  "Our Supplier Toolkit frees up hours of admin time, so you can focus on what you do best.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Row 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4 lg:order-first">
              <h3 className="text-2xl md:text-3xl font-semibold flex items-center text-gray-900 dark:text-white">
                <Users className="w-7 h-7 mr-3 text-primary-600 dark:text-primary-400" />
                Expand Your Reach, Effortlessly
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Connect with a wider audience and attract more customers without the hassle of extensive marketing.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {[
                  "Get discovered by thousands of parents planning parties in your area.",
                  "Showcase your unique services with a professional, customizable profile.",
                  "Benefit from BookABash's marketing efforts to drive more leads to you.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-last">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460401/aditya-chinchure-hfEn4mRi3u0-unsplash_polxrq.jpg"
                alt="Expanding reach with BookABash"
                width={600}
                height={450}
                className="rounded-xl shadow-xl mx-auto"
              />
            </div>
          </div>
          {/* Row 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460465/amelia-white-vn9kxZgJRwc-unsplash_iwupt9.jpg"
                alt="Simplified workflow with BookABash"
                width={600}
                height={450}
                className="rounded-xl shadow-xl mx-auto"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-semibold flex items-center text-gray-900 dark:text-white">
                <Settings2 className="w-7 h-7 mr-3 text-primary-600 dark:text-primary-400" />
                Simplify Your Workflow
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform automates and streamlines many administrative tasks, saving you time and effort.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {[
                  "Receive automated notifications for new inquiries and bookings.",
                  "Manage all your communications and bookings from a centralized dashboard.",
                  "Access analytics and reporting to track your performance and growth.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section - New Design */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Partners <span className="text-primary-600 dark:text-primary-400">Love BookABash</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Real stories from suppliers who've transformed their business with us.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-850 rounded-lg shadow-xl overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <Image
                    src={"https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg"}
                    alt={`Photo of ${story.name}`}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <Button
                    asChild
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:left-6 md:transform-none bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Link href={story.storyLink}>Read The Story</Link>
                  </Button>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{story.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">{story.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">{story.quote}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-slate-700"
            >
              View More Success Stories
            </Button>
          </div>
        </div>
      </section>

      <section
        className="py-16 md:py-24 bg-gray-50 dark:bg-slate-850 relative overflow-hidden"
        style={ctaBackgroundStyle}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to <span className="text-primary-600 dark:text-primary-400">Elevate</span> Your Business?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 lg:mb-0">
                Join BookABash today and start connecting with more customers. It only takes a minute to sign up and
                unlock a world of opportunities!
              </p>
            </div>
            <Card className="bg-white dark:bg-slate-800 shadow-2xl rounded-lg">
              <CardContent className="p-6 md:p-10 text-gray-900 dark:text-white">
                <SupplierForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

     
    </div>
  )
}
