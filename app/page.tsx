import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  QrCode,
  Shield,
  Smartphone,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Upload,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Access",
      description:
        "Guests scan QR codes for instant access to event galleries without needing accounts.",
    },
    {
      icon: Upload,
      title: "Easy Photo Upload",
      description:
        "Simple, mobile-optimized interface for guests to upload photos directly from their phones.",
    },
    {
      icon: Shield,
      title: "Content Moderation",
      description:
        "All uploads require host approval before appearing publicly, ensuring quality control.",
    },
    {
      icon: Eye,
      title: "Real-time Galleries",
      description:
        "Photos appear in galleries immediately after approval for instant event memories.",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description:
        "Optimized for mobile devices where most event photos are taken and shared.",
    },
    {
      icon: Users,
      title: "Event Management",
      description:
        "Hosts can create, manage, and moderate multiple events from a central dashboard.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Event",
      description:
        "Sign up and create a new event gallery with custom settings and moderation controls.",
    },
    {
      number: "02",
      title: "Generate QR Code",
      description:
        "Get a unique QR code for your event that guests can scan for instant access.",
    },
    {
      number: "03",
      title: "Share with Guests",
      description:
        "Display the QR code at your event or share it digitally with attendees.",
    },
    {
      number: "04",
      title: "Collect & Moderate",
      description:
        "Guests upload photos, you approve them, and everyone enjoys the shared memories.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-brand-50">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="absolute bottom-0 w-full h-[60vh]">
          <Image
            src="/images/mt_pangasugan.png"
            alt="Hero"
            fill
            className="object-contain object-bottom"
            loading="eager"
          />
        </div>

        <div className="relative z-10">
          <div className="w-full !px-6 sm:px-8 lg:px-12 !py-20 lg:py-32 flex justify-center">
            <div className="text-center max-w-4xl !mt-24">
              <Badge variant="outline" className="!mb-8 text-sm">
                Professional Event Photo Collection
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-16 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
                Effortless Event Photo Sharing
                <br />
                with QR Code Access
              </h1>



              <p className="text-xl text-muted-foreground !mb-12 !mt-24">
                Create event photo galleries that guests can access instantly by
                scanning QR codes. No apps to download, no accounts required for
                guests – just scan, upload, and share memories.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 min-w-[200px]">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 min-w-[200px]"
                  >
                    <QrCode className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="flex flex-col items-center space-y-1">
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }} />
          
        </div>
        <p className="text-sm text-muted-foreground mt-3 animate-pulse">
          Discover features
        </p>
      </div>
      </section>

      {/* Features Section */}
      <section className="!bg-background py-20 bg-muted/30">
        <div className="w-full !px-4 sm:px-8 lg:px-12 !py-20 lg:py-24 flex justify-center">
          <div className="text-center max-w-7xl w-full">
            <div className="text-center !mb-16">
              <h2 className="text-3xl lg:text-4xl !mb-6">
                Everything You Need for Event Photo Collection
              </h2>
              <p className="text-base !px-12 text-muted-foreground max-w-6xl mx-auto">
                Professional-grade features designed specifically for schools,
                organizations, and event hosts who want seamless photo
                collection from their guests.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="h-full hover:shadow-lg transition-shadow !p-[30px_70px_32px_26px] p-6 lg:p-8 xl:p-10 w-full border-white/50 bg-[#EBECFC]"
                  >
                    <CardHeader>
                      <div className="w-[90px] h-[90px] rounded-xl flex items-center justify-center !mb-4">
                        <Icon className="w-[85px] h-[85px] text-brand-500" />
                      </div>
                      <CardTitle className="text-xl text-left">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-justify text-xs">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="w-full !px-6 sm:px-8 lg:px-12 !py-24 lg:py-24 flex justify-center">
          <div className="text-center max-w-6xl w-full">
            <div className="text-center !mb-16">
              <h2 className="text-3xl lg:text-4xl !mb-6 text-[#545454]">
                How It Works
              </h2>
              <p className="text-base !px-4 text-muted-foreground">
                Set up professional event photo collection in minutes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="text-center border-brand-500 max-w-xs justify-items-center"
                >
                  <div className="w-20 h-20 bg-white border-3 border-brand-500 text-brand-500 rounded-full flex items-center justify-center mx-auto !mb-6 text-[25px] font-bold">
                    {step.number}
                  </div>
                  <h3 className="!text-base !mb-4">{step.title}</h3>
                  <p className="text-muted-foreground !text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="w-full !px-6 sm:px-8 lg:px-12 !py-20 lg:py-24 flex justify-center">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl !mb-8">
                  Perfect for Schools & Organizations
                </h2>
                <p className="text-lg text-muted-foreground !mb-8 leading-relaxed">
                  Designed specifically for educational institutions,
                  nonprofits, and professional event organizers who need
                  reliable, secure photo collection with proper moderation
                  controls.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 !mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg">
                        No Guest Accounts Required
                      </p>
                      <p className="text-muted-foreground">
                        Guests scan QR codes for instant access
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 !mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg">
                        Professional Moderation
                      </p>
                      <p className="text-muted-foreground">
                        All uploads require host approval before going public
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 !mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg">Mobile-Optimized</p>
                      <p className="text-muted-foreground">
                        Perfect for on-the-go photo uploads at events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 !mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-lg">Content Reporting</p>
                      <p className="text-muted-foreground">
                        Built-in reporting system for inappropriate content
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 !px-6 text-center !py-6 hover:shadow-lg transition-shadow border-white/50">
                    <QrCode className="w-14 h-14  text-primary w-full" />
                    <p className="font-medium text-xl">QR Access</p>
                    <p className="text-muted-foreground text-sm">
                      Instant gallery access
                    </p>
                  </Card>

                  <Card className="p-6 !px-6 text-center !py-6 text-center hover:shadow-lg transition-shadow border-white/50">
                    <Shield className="w-14 h-14 mx-auto !mb-4 text-primary w-full" />
                    <p className="font-medium text-xl">Moderated</p>
                    <p className="text-muted-foreground">
                      Host-approved content
                    </p>
                  </Card>

                  <Card className="p-6 !px-6 text-center !py-6 hover:shadow-lg transition-shadow border-white/50">
                    <Smartphone className="w-14 h-14 mx-auto !mb-4 text-primary w-full" />
                    <p className="font-medium text-xl">Mobile First</p>
                    <p className="text-muted-foreground">
                      Optimized for phones
                    </p>
                  </Card>

                  <Card className="p-6 !px-6 text-center !py-6 hover:shadow-lg transition-shadow border-white/50">
                    <Zap className="w-14 h-14 mx-auto !mb-4 text-primary w-full" />
                    <p className="font-medium text-xl">Real-time</p>
                    <p className="text-muted-foreground">
                      Instant photo sharing
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Highlights Section */}
      <section className="py-20">
        <div className="w-full !px-6 sm:px-8 lg:px-12 !py-20 lg:py-24 flex justify-center">
          <div className="max-w-6xl w-full">
            <div className="event-highlights">
              <div className="group-15">
                <div className="text-center !mb-12">
                  <div className="flex flex-col items-center">
                    {/* Star Icon - Using img tag for SVG file */}
                    <div className="w-16 h-16 backdrop-blur-[8.1px] bg-white/46 border border-white shadow-md rounded-xl flex items-center justify-center">
                      <img
                        src="icons/stars-02.svg"
                        alt="Star Icon"
                        className="w-10 h-10 text-primary"
                      />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold mt-4 text-[#545454]">
                      Event Highlights
                    </div>
                  </div>
                </div>

                <div className="discover-the-best-moments !px-16 text-base text-muted-foreground text-center !mb-16 leading-relaxed">
                  Discover the best moments from across all school events,
                  automatically curated from our photo collections to showcase
                  the most memorable experiences.
                </div>
              </div>

              {/* Stacked Cards Section */}
              <div
                className="relative 
                h-[180px] 
                sm:h-[220px]
                md:h-[320px]
                lg:h-[400px]
                xl:h-[500px]
                mb-8
                sm:mb-12
                md:mb-16
                lg:mb-20
                flex items-center justify-center
              "
              >
                {/* Wrapper that scales without affecting layout */}
                <div
                  className="
                  scale-[0.45]
                  sm:scale-[0.6]
                  md:scale-[0.7]
                  lg:scale-[0.85]
                  xl:scale-100
                  origin-center
                  w-[372px] h-[328px]
                  drop-shadow-2xl
                "
                >
                  {/* Card 4 - Smallest, back */}
                  <div
                    className="absolute transition-all duration-300 hover:scale-105"
                    style={{
                      transform: `translate(-220px, 30px) scale(0.61)`,
                      zIndex: 1,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="w-[372px] p-3 rounded-[20px]">
                      <div className="w-full h-[328px] rounded-[33px] overflow-hidden relative shadow-2xl">
                        <img
                          src="/images/dormitory 4.png"
                          alt="Dormitory Team building"
                          className="w-full h-full object-cover"
                        />
                        {/* Text INSIDE image container */}
                        <div className="absolute bottom-3 left-3 right-3 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-[22px] py-1 shadow-lg">
                          <p className="text-[#323031] !px-6 text-left text-sm">
                            Dormitory Team building
                          </p>
                          <p className="text-[#022c44] !px-6 text-left text-[10px]">
                            Sport
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    className="absolute transition-all duration-300 hover:scale-105"
                    style={{
                      transform: `translate(-90px, 20px) scale(0.765)`,
                      zIndex: 2,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="w-[372px] p-3 rounded-[20px]">
                      <div className="w-full h-[328px] rounded-[33px] overflow-hidden relative shadow-2xl">
                        <img
                          src="/images/image 3.png"
                          alt="Annual Assembly"
                          className="w-full h-full object-cover"
                        />
                        {/* Text INSIDE image container */}
                        <div className="absolute bottom-3 left-3 right-3 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-[22px] py-1 shadow-lg">
                          <p className="text-[#062a40] !px-6 text-left text-sm">
                            Annual Assembly
                          </p>
                          <p className="text-[#022c44] !px-6 text-left text-[10px]">
                            General
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    className="absolute transition-all duration-300 hover:scale-105"
                    style={{
                      transform: `translate(50px, 10px) scale(0.9)`,
                      zIndex: 3,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="w-[372px] p-3 rounded-[20px]">
                      <div className="w-full h-[328px] rounded-[33px] overflow-hidden relative shadow-2xl">
                        <img
                          src="/images/image 2.png"
                          alt="Annual Assembly"
                          className="w-full h-full object-cover"
                        />
                        {/* Text INSIDE image container */}
                        <div className="absolute bottom-3 left-3 right-3 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-[22px] py-1 shadow-lg">
                          <p className="text-white !px-6 text-left text-sm">
                            Annual Assembly
                          </p>
                          <p className="text-[#858ded] !px-6 text-left text-[10px]">
                            General
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 1 - Largest, front */}
                  <div
                    className="absolute transition-all duration-300 hover:scale-105"
                    style={{
                      transform: `translate(180px, 0px) scale(1)`,
                      zIndex: 4,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="w-[372px] p-3 rounded-[20px]">
                      <div className="w-full h-[328px] rounded-[33px] overflow-hidden relative shadow-2xl">
                        <img
                          src="/images/image 1.png"
                          alt="Graduation 2024"
                          className="w-full h-full object-cover"
                        />
                        {/* Text INSIDE image container */}
                        <div className="absolute bottom-3 left-3 right-3 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-[22px] py-1 shadow-lg">
                          <p className="text-white !px-6 text-left text-sm">
                            Graduation 2024
                          </p>
                          <p className="text-[#8a8a8a] !px-6 text-left text-[10px]">
                            Academic
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Timeline Section */}
      <section className="py-20 bg-white">
        <div className="w-full !px-6 sm:px-8 lg:px-12 !py-20 lg:py-24 flex justify-center">
          <div className="max-w-6xl w-full">
            {/* Header Section */}
            <div className="text-center !mb-16">
              <div className="flex items-center justify-center gap-4 !mb-6">
                {/* Calendar Icon */}
                <div className="w-16 h-16 backdrop-blur-[8.1px] bg-white/46 border border-white shadow-md rounded-xl flex items-center justify-center">
                  <img
                    src="icons/calendar.svg"
                    alt="Calendar Icon"
                    className="w-10 h-10 text-primary"
                  />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#545454]">
                  Event Timeline
                </h2>
              </div>
              <p className="text-base text-muted-foreground !px-8 leading-relaxed">
                Stay updated with upcoming events and relive the highlights from
                recent celebrations. Each event has its own QR code for instant
                access.
              </p>
            </div>

            {/* Timeline Events */}
            <div className="relative">
              {/* Event 1 - Graduation 2024 */}
              <div className="flex gap-8 items-start !mb-12">
                {/* Timeline Indicator with Image */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white border-2 border-[#858ded] rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src="icons/Variant3.svg"
                      alt="Event"
                      className="w-8 h-8 text-fade object-cover"
                    />
                  </div>
                  <div className="bg-[#858ded] h-24 w-0.5"></div>
                </div>

                {/* Event Card */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="relative">
                      <div className="w-full h-64 rounded-[33px] overflow-hidden">
                        <img
                          src="images/image 1.png"
                          alt="Graduation 2024"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-6 py-2">
                        <p className="text-white text-center font-semibold">
                          Graduation 2024
                        </p>
                        <p className="text-[#8a8a8a] text-center text-sm">
                          Academic
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-[#333333]">
                        Graduation 2024
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Celebrate the achievements of our graduating class with
                        memorable photos from the ceremony and reception.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>June 15, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event 2 - Annual Assembly */}
              <div className="flex gap-8 items-start !mb-12">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white border-2 border-[#858ded] rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src="icons/calendar-check-02.svg"
                      alt="Event"
                      className="w-8 h-8 object-cover" // Remove object-cover and rounded-full for SVGs
                    />
                  </div>
                  <div className="bg-[#858ded] h-24 w-0.5"></div>
                </div>

                {/* Event Card */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="relative">
                      <div className="w-full h-64 rounded-[33px] overflow-hidden">
                        <img
                          src="images/image 3.png"
                          alt="Annual Assembly"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 backdrop-blur-[5.1px] bg-white/10 border border-white/28 rounded-[20px] px-6 py-2">
                        <p className="text-[#062a40] text-center font-semibold">
                          Annual Assembly
                        </p>
                        <p className="text-[#022c44] text-center text-sm">
                          General
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-[#333333]">
                        Annual Assembly
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Our yearly gathering featuring student performances,
                        awards, and community celebrations.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>May 20, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-300 text-primary-foreground">
        <div className="w-full !px-6 sm:px-8 lg:px-12 !py-20 lg:py-24 flex justify-center">
          <div className="text-center max-w-4xl w-full">
            <h2 className="text-3xl lg:text-4xl !mb-6">
              Ready to Transform Your Event Photo Collection?
            </h2>
            <p className="text-lg opacity-90 !mb-12 w-full">
              Join schools and organizations already using our platform for
              seamless, professional event photo sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2 min-w-[200px]"
                >
                  Start Free Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {/* <Link href="/demo">
                <Button variant="outline" size="lg" className="gap-2 min-w-[200px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <QrCode className="w-4 h-4" />
                  View Demo
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
