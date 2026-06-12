import LegalPage, {
  BulletList,
  Callout,
  EmailContactCard,
  LegalSection,
  QuickSummary,
} from "@/components/LegalPage";
import TextLink from "@/components/TextLink";
import { CONTACT_EMAIL } from "@/lib/site";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Our Privacy Commitment",
    body: (
      <p>
        Asetta is operated from Ontario, Canada. We respect your privacy and are committed to
        protecting your personal information in compliance with Canada's Personal Information
        Protection and Electronic Documents Act (PIPEDA) and applicable Ontario law. This policy
        explains how we collect, use, and protect your information.
      </p>
    ),
  },
  {
    title: "Information We Collect",
    body: (
      <>
        <p>We collect only the information necessary to provide our academic management services:</p>
        <BulletList
          items={[
            "Your name and email address for account creation",
            "Course outlines and academic documents you upload",
            "Academic information extracted from your documents (deadlines, assignments)",
            "Email preferences and notification settings",
            "Basic usage information to improve our service",
            "Website analytics and interaction data through Google Analytics",
          ]}
        />
      </>
    ),
  },
  {
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use your information only for the purposes you expect:</p>
        <BulletList
          items={[
            "Provide AI-powered assessment tracking and deadline management",
            "Send email notifications about upcoming deadlines (if you choose)",
            "Store and sync your academic data securely",
            "Improve our platform functionality and AI accuracy",
            "Provide customer support when needed",
          ]}
        />
      </>
    ),
  },
  {
    title: "AI Processing",
    body: (
      <>
        <p>We use AI to extract academic information from your course outlines:</p>
        <BulletList
          items={[
            "Your uploaded files are processed using Google's Gemini AI",
            "Files are deleted after processing; we don't store the original documents",
            "You can request to opt-out of AI processing (this limits functionality)",
          ]}
        />
        <Callout title="AI accuracy notice">
          <p>
            AI-extracted information may contain errors. Always verify important dates and details
            against your original documents.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "Website Analytics & Tracking",
    body: (
      <>
        <p>
          We use Google Analytics 4 to understand how visitors use our website and improve our
          services:
        </p>
        <BulletList
          items={[
            "Page views, session duration, and navigation patterns",
            "Device type, browser, and general location (city/region level)",
            "Button clicks and form interactions on our marketing site",
            "Traffic sources (how you found our website)",
          ]}
        />

        <h3 className="pt-2 text-lg font-semibold text-stone-900">
          Cookies & tracking technologies
        </h3>
        <p>
          Google Analytics uses cookies and similar technologies to collect this information.
          These are small files stored on your device that help us:
        </p>
        <BulletList
          items={[
            "Distinguish between different visitors",
            "Remember your preferences for future visits",
            "Analyze site performance and user experience",
          ]}
        />

        <h3 className="pt-2 text-lg font-semibold text-stone-900">Your control over tracking</h3>
        <p>You have several options to control or disable tracking:</p>
        <BulletList
          items={[
            "Use browser settings to block or delete cookies",
            <>
              Install the{" "}
              <TextLink href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics Opt-out Browser Add-on
              </TextLink>
            </>,
            'Enable "Do Not Track" in your browser settings',
          ]}
        />

        <Callout title="Legal basis for analytics">
          <p>
            We collect analytics data based on our legitimate interest in improving our website
            and services. This is permitted under GDPR Article 6(1)(f) and similar privacy laws.
            You can opt-out at any time using the methods above.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "How We Protect Your Data",
    body: (
      <>
        <p>We use industry-standard security measures to protect your information:</p>
        <BulletList
          items={[
            "Secure authentication through Firebase",
            "Encrypted data transmission and storage",
            "Google Cloud's secure infrastructure",
            "Regular security monitoring and updates",
          ]}
        />
        <p>
          If a data breach creates a real risk of significant harm to you, we will notify you and
          report the breach to the Privacy Commissioner of Canada, as required by PIPEDA.
        </p>
      </>
    ),
  },
  {
    title: "Where Your Data Is Stored",
    body: (
      <p>
        Your data is stored with our service providers (Google Firebase and Google Cloud), whose
        servers may be located outside of Canada, including in the United States. While your
        information is outside Canada, it is subject to the laws of those jurisdictions and may be
        accessible to the courts and authorities there. We use providers with strong contractual
        and technical safeguards, and by using Asetta you acknowledge this cross-border storage
        and processing.
      </p>
    ),
  },
  {
    title: "Your Privacy Rights",
    body: (
      <>
        <p>Under PIPEDA, you have the right to:</p>
        <BulletList
          items={[
            "Access and download your personal information",
            "Correct any inaccurate information",
            "Delete your account and all associated data",
            "Withdraw consent for data processing",
            "Control how your data is used for AI processing",
            "Opt-out of website analytics and tracking",
            "File complaints with the Privacy Commissioner of Canada",
          ]}
        />
        <Callout title="How to exercise your rights">
          <p>
            Email us at {CONTACT_EMAIL} with "Privacy Request" in the subject line. We'll respond
            within 30 days as required by law.
          </p>
        </Callout>
      </>
    ),
  },
  {
    title: "How Long We Keep Your Data",
    body: (
      <BulletList
        items={[
          "Academic data: kept while your account is active",
          "Uploaded files: deleted within 24 hours after processing",
          "Account deletion: all data permanently removed within 30 days",
          "Usage analytics: anonymized after 2 years",
          "Google Analytics data: automatically deleted after 14 months",
        ]}
      />
    ),
  },
  {
    title: "Third-Party Services",
    body: (
      <>
        <p>We work with trusted services to provide our platform:</p>
        <BulletList
          items={[
            "Google Firebase for secure data storage and authentication",
            "Google Gemini AI for document processing",
            "Email services for deadline notifications",
            "Google Analytics 4 for website analytics and user behavior insights",
          ]}
        />

        <h3 className="pt-2 text-lg font-semibold text-stone-900">
          Google Analytics data processing
        </h3>
        <p>Google Analytics processes your website interaction data under our instructions:</p>
        <BulletList
          items={[
            "Data is shared with Google for analytics processing only",
            "Google's data retention is set to 14 months for our account",
            "Data is anonymized and aggregated for reporting",
            <>
              Google's privacy policy applies:{" "}
              <TextLink href="https://policies.google.com/privacy">
                policies.google.com/privacy
              </TextLink>
            </>,
          ]}
        />
      </>
    ),
  },
  {
    title: "Privacy Questions & Complaints",
    body: (
      <>
        <p>
          For privacy questions, complaints, or to exercise your rights, contact our Privacy
          Officer:
        </p>
        <EmailContactCard email={CONTACT_EMAIL} caption="Privacy Officer, Asetta" />
        <Callout title="Privacy Commissioner of Canada">
          <p>If you're not satisfied with our response, you can file a complaint with:</p>
          <p>
            <strong>Privacy Commissioner of Canada</strong>
            <br />
            Phone: 1-800-282-1376
            <br />
            Website: www.priv.gc.ca
          </p>
        </Callout>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      metaTitle="Privacy Policy | Asetta"
      metaDescription="Privacy Policy for Asetta - Your trusted academic management platform"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      lastUpdated="June 11, 2026"
      toc={SECTIONS.map((section) => section.title)}
    >
      <QuickSummary
        columns={[
          {
            entries: [
              {
                heading: "What we collect",
                text: "Name, email, course outlines, academic data, usage information, website analytics",
              },
              {
                heading: "How we use it",
                text: "AI processing, deadline notifications, platform improvements",
              },
            ],
          },
          {
            entries: [
              {
                heading: "Your rights",
                text: "Access, correct, delete data; control AI processing; opt-out of analytics",
              },
              {
                heading: "Security",
                text: "Encrypted storage, secure authentication, Google Cloud",
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
