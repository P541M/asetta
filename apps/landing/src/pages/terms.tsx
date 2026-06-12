import LegalPage, {
  BulletList,
  Callout,
  EmailContactCard,
  LegalSection,
  QuickSummary,
} from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Agreement to Terms",
    body: (
      <>
        <p>
          By using Asetta, you agree to these terms and our use of cookies and analytics as
          described in our Privacy Policy. These terms comply with the Personal Information
          Protection and Electronic Documents Act (PIPEDA) and the Copyright Act of Canada.
        </p>
        <p>
          You must be at least 13 years old to use Asetta. If you are under the age of majority
          in your province or territory, you confirm that a parent or guardian has reviewed and
          agreed to these terms on your behalf.
        </p>
      </>
    ),
  },
  {
    title: "Your Responsibilities",
    body: (
      <BulletList
        items={[
          "Only upload course outlines and academic materials you have permission to use",
          "Ensure uploaded content doesn't violate copyright or your institution's policies",
          "Use the platform for academic organization, not to complete academic work",
          "Keep your account secure and don't share login credentials",
          "Verify AI-extracted information against your original documents",
        ]}
      />
    ),
  },
  {
    title: "How Our Platform Works",
    body: (
      <>
        <p>
          Asetta uses AI to process your uploaded course outlines and extract assessment
          information. Here's what you should know:
        </p>
        <BulletList
          items={[
            "AI accuracy is not guaranteed, so always double-check extracted information",
            "Email notifications depend on your email provider and may be delayed",
            "You remain responsible for managing your academic deadlines",
            "The service may be temporarily unavailable for maintenance",
          ]}
        />
      </>
    ),
  },
  {
    title: "Website Analytics & Tracking Consent",
    body: (
      <>
        <p>
          By using our website, you consent to our collection of analytics data through cookies
          and similar technologies:
        </p>
        <BulletList
          items={[
            "We use Google Analytics 4 to understand how visitors use our website",
            "Analytics data helps us improve user experience and optimize our platform",
            "You can opt-out of tracking using browser settings or Google's opt-out tools",
            "Opting out of analytics does not affect your ability to use our platform",
          ]}
        />
        <Callout title="Analytics data use">
          <p>
            We collect analytics data based on our legitimate business interest in improving our
            services. Full details about what data we collect and how to opt-out are available in
            our Privacy Policy.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "Copyright and Course Materials",
    body: (
      <>
        <p>
          When uploading course outlines, you confirm you have permission under Canada's Copyright
          Act fair dealing provisions for educational purposes. If content is reported for
          copyright infringement:
        </p>
        <BulletList
          items={[
            "We will investigate copyright complaints within 48 hours",
            "Infringing content will be removed and users notified",
            "You can file a counter-notice if you believe content was wrongly removed",
          ]}
        />
        <Callout title="Educational fair dealing">
          <p>
            Canadian copyright law allows fair dealing for educational purposes, but this doesn't
            protect all educational content from copyright claims. Only upload materials you have
            clear permission to use.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "Content Ownership",
    body: (
      <BulletList
        items={[
          "You own all academic content and notes you create or upload",
          "We own the platform, software, and AI technology",
          "You give us permission to process your files to provide our services",
          "We don't claim ownership of your academic work",
        ]}
      />
    ),
  },
  {
    title: "Our Liability Limits",
    body: (
      <>
        <p>
          Asetta is provided "as is" without warranties. To the extent permitted by Ontario law,
          we're not liable for:
        </p>
        <BulletList
          items={[
            "Missed deadlines due to AI errors, notification failures, or service outages",
            "Academic consequences from relying on platform information",
            "Data loss or technical issues with third-party services",
            "Any damages exceeding CAD $100",
          ]}
        />
        <Callout title="Important academic reminder">
          <p>
            You remain fully responsible for managing your academic deadlines. Asetta is a tool to
            assist with organization, not replace personal academic responsibility.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "Termination",
    body: (
      <p>
        You may stop using Asetta and delete your account at any time from your account settings.
        We may suspend or terminate accounts that violate these terms, after reasonable notice
        where practical. Sections covering content ownership, liability limits, and governing law
        survive termination.
      </p>
    ),
  },
  {
    title: "Governing Law and Disputes",
    body: (
      <p>
        These terms are governed by the laws of the Province of Ontario and the federal laws of
        Canada applicable in Ontario. Any dispute arising from these terms or your use of Asetta
        will be resolved exclusively in the courts of Ontario, Canada, and you consent to the
        jurisdiction of those courts.
      </p>
    ),
  },
  {
    title: "Changes and Contact",
    body: (
      <>
        <p>
          We may update these terms occasionally. We'll notify users of material changes. For
          questions or legal matters, contact:
        </p>
        <EmailContactCard email={CONTACT_EMAIL} caption="Legal Affairs, Asetta" />
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      metaTitle="Terms of Service | Asetta"
      metaDescription="Terms of Service for Asetta - Your trusted academic management platform"
      title="Terms of Service"
      subtitle="Please read these terms carefully. By using Asetta, you agree to be bound by them."
      lastUpdated="June 11, 2026"
      toc={SECTIONS.map((section) => section.title)}
    >
      <QuickSummary
        columns={[
          {
            entries: [
              {
                heading: "Your responsibilities",
                text: "Only upload course outlines you have permission to use; consent to analytics",
              },
              {
                heading: "What you own",
                text: "Your academic content; we own the platform",
              },
            ],
          },
          {
            entries: [
              {
                heading: "Our responsibility",
                text: "Provide the service; no guarantees on AI accuracy",
              },
              {
                heading: "Academic use",
                text: "For organization only, not completing academic work",
              },
            ],
          },
        ]}
      />

      {SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.body}
        </LegalSection>
      ))}
    </LegalPage>
  );
}
