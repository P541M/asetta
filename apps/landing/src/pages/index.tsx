import ButtonLink from "@/components/Button";
import Container from "@/components/Container";
import CTAPanel from "@/components/CTAPanel";
import FeatureGrid from "@/components/FeatureGrid";
import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ChevronsLeftRightIcon } from "@/components/icons";
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "@/components/ui/image-comparison";
import { CHALLENGES, HOME_FEATURES } from "@/lib/features";
import { REGISTER_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export default function LandingPage() {
  return (
    <Layout title={SITE_TITLE} description={SITE_DESCRIPTION}>
      {/* Hero: tagline up top, product visible in the first viewport */}
      <section className="pb-24 md:pb-32">
        <Container>
          <Reveal className="mx-auto max-w-3xl pt-4 text-center md:pt-8">
            <h1 className="text-[clamp(2.5rem,1.5rem+4vw,4.25rem)] font-semibold leading-[1.08] tracking-tight text-stone-900">
              Always ahead, never behind.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl">
              Asetta is a free, AI-powered academic assistant that keeps you on top of assignments,
              deadlines, and grades.
            </p>

            <div className="mt-9 flex items-center justify-center gap-2">
              <ButtonLink href={REGISTER_URL} size="lg" trackLabel="Get Started - Hero">
                Get started
              </ButtonLink>
              <ButtonLink
                href="/features"
                variant="ghost"
                size="lg"
                withArrow
                trackLabel="Explore Features - Hero"
              >
                Explore features
              </ButtonLink>
            </div>
          </Reveal>

          {/* Dashboard preview, cresting into the first screen */}
          <Reveal delay={0.1} className="mx-auto mt-12 max-w-5xl md:mt-16">
            <div className="overflow-hidden rounded-2xl shadow-[0_32px_80px_-32px_rgb(28_25_23/0.35)]">
              {/* macOS-style window bar */}
              <div className="relative flex items-center bg-stone-100 px-4 py-3">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-stone-400">
                  asetta.me
                </span>
              </div>
              <ImageComparison className="aspect-video w-full">
                <ImageComparisonImage
                  src="/images/Dark_Prev.png"
                  alt="Asetta dashboard in dark mode"
                  position="left"
                />
                <ImageComparisonImage
                  src="/images/Light_Prev.png"
                  alt="Asetta dashboard in light mode"
                  position="right"
                />
                <ImageComparisonSlider className="bg-white shadow-sm">
                  <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white shadow-md">
                    <ChevronsLeftRightIcon className="h-4 w-4 text-stone-400" />
                  </div>
                </ImageComparisonSlider>
              </ImageComparison>
            </div>
            <p className="mt-4 text-center text-xs text-stone-400">
              Drag to compare dark and light mode
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Student challenges: white tiles on a tinted band */}
      <section className="bg-stone-50 py-24 md:py-32">
        <Container>
          <SectionHeading
            align="split"
            title="Every semester, the same struggles"
            lead="You're not alone. These challenges are universal, but they don't have to be permanent."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CHALLENGES.map((challenge, index) => (
              <Reveal key={challenge.title} delay={index * 0.06} className="h-full">
                <div className="h-full rounded-xl bg-white p-7">
                  <span className="text-sm tabular-nums text-stone-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-stone-900">{challenge.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-stone-600">
                    {challenge.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="pt-24 md:pt-32">
        <Container>
          <SectionHeading
            align="split"
            title="Everything you need to stay organized"
            lead="Each feature addresses a real student problem, turning chaos into structure."
          />

          <FeatureGrid features={HOME_FEATURES} layout="featured" />

          <Reveal className="mt-12 text-center">
            <ButtonLink
              href="/features"
              variant="ghost"
              size="lg"
              withArrow
              trackLabel="See All Features - Home"
            >
              See all features
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* Closing CTA */}
      <CTAPanel
        title="Get organized today"
        lead="Organize your semesters, track your grades, and never miss a deadline. Free for students."
        trackLabel="Get Started - Home CTA"
      />
    </Layout>
  );
}
