import Container from "@/components/Container";
import CTAPanel from "@/components/CTAPanel";
import FeatureGrid from "@/components/FeatureGrid";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { FEATURES } from "@/lib/features";

export default function FeaturesPage() {
  return (
    <Layout
      title="Features | Asetta"
      description="Discover Asetta's powerful features for academic organization: semester management, grade calculator, calendar system, and more. Completely free."
    >
      <Container>
        <PageHero
          title="Features"
          subtitle="Tools for tracking assessments, calculating grades, and managing deadlines across every semester."
        />

        <FeatureGrid features={FEATURES} layout="bento" />
      </Container>

      <CTAPanel
        title="Ready to get started?"
        lead="Organize your academic work, track grades, and manage deadlines. Free for students."
        trackLabel="Get Started - Features CTA"
        secondaryLabel="Contact us"
        secondaryHref="/contact"
      />
    </Layout>
  );
}
