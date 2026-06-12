import Container from "@/components/Container";
import ContentSection from "@/components/ContentSection";
import CTAPanel, { CTAPanelCard } from "@/components/CTAPanel";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";

export default function AboutPage() {
  return (
    <Layout
      title="About Us | Asetta"
      description="Learn about Asetta's mission to support students transitioning to post-secondary independence. We're here when you need us, until you don't need us anymore."
    >
      <Container>
        <div className="mx-auto max-w-3xl">
          <PageHero
          title="Our story"
          subtitle="Why we built Asetta and how we're supporting students through the challenges of post-secondary life."
        />

        <div className="space-y-16 md:space-y-20">
          <ContentSection title="Our mission">
            <p>
              At Asetta, we believe that the transition to post-secondary education shouldn't mean
              losing the academic support you need. While students gain independence, they also
              face more complex coursework, tighter deadlines, and increased responsibility,
              often without the structured guidance they've always had.
            </p>
            <p>
              We're here to bridge that gap. Asetta uses AI to help students track deadlines,
              organize assignments, and manage their academic workload with less effort and
              stress.
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                We're here when you need us, until you don't need us anymore.
              </strong>
            </p>
          </ContentSection>

          <ContentSection title="Why we built Asetta">
            <p>
              From elementary school through high school, our entire educational journey was
              guided. Teachers told us exactly when assignments were due, what to study, and how
              to manage our time. Then post-secondary education arrives, whether university,
              college, or trade school, and suddenly that structure disappears. No more daily
              check-ins. No more guided schedules. You're expected to independently manage
              complex coursework, deadlines, and academic goals.
            </p>
            <p>
              We recognized that students don't need less independence. They need better tools to
              manage that independence effectively. Think of Asetta as the support system you
              wish you had, helping you focus on learning and growing rather than constantly
              worrying about missed deadlines or forgotten assignments.
            </p>
          </ContentSection>

          {/* Founder's note */}
          <Reveal>
            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                A note from our founder
              </h2>

              <blockquote className="mt-6 border-l-2 border-stone-300 pl-6 text-lg font-medium italic leading-relaxed text-stone-700 md:text-xl">
                "I was completely overwhelmed in my first year. Going from structured high school
                to managing complex course loads and deadlines felt impossible."
              </blockquote>

              <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone-700">
                <p>
                  Despite being successful in high school, I was constantly stressed about missing
                  assignments and deadlines. I wasn't alone. Most of my friends were struggling
                  with the same transition from structured support to complete academic
                  independence. As a software engineering student, I realized technology could
                  bridge that gap. So I built Asetta, not as a business opportunity, but as the
                  solution I desperately needed.
                </p>
                <p>
                  I remembered that feeling of stress and knew financial barriers shouldn't
                  prevent students from getting help.{" "}
                  <strong className="font-semibold text-stone-900">
                    That's why Asetta will always remain completely free for students.
                  </strong>
                </p>
                <p>
                  I'm now in my fourth year and still use Asetta daily to manage my course load
                  and deadlines. Every feature comes from something I've needed or heard other
                  students ask for. If my first-year struggles can help even one student feel
                  more in control of their academic journey, every hour building this was worth
                  it.
                </p>
              </div>

              <footer className="mt-8 border-t border-stone-200 pt-6">
                <p className="font-semibold text-stone-900">Eleazar</p>
                <p className="mt-1 text-sm text-stone-500">
                  Founder & Student · 4th Year Software Engineering, University of Guelph
                </p>
              </footer>
            </section>
          </Reveal>
        </div>
        </div>
      </Container>

      <CTAPanel
        title="Our promise to students"
        lead="We're here to support you through the challenges of post-secondary life, whether that's your first semester or your final year."
        trackLabel="Get Started - About CTA"
      >
        <CTAPanelCard title="Always free">
          Because every student deserves academic support, regardless of their financial
          situation.
        </CTAPanelCard>
        <CTAPanelCard title="Student-centered">
          Built by students who understand the challenges, designed to support your success.
        </CTAPanelCard>
      </CTAPanel>
    </Layout>
  );
}
