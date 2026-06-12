import Container from "./Container";
import Layout from "./Layout";
import Reveal from "./Reveal";
import TextLink from "./TextLink";

/** Anchor id for a section title, shared by LegalSection and the TOC. */
function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Bulleted list with a quiet dot marker, used throughout the legal pages. */
export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" aria-hidden />
          <span className="text-stone-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Neutral note box (e.g. AI accuracy notice, legal basis explanations). */
export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl bg-stone-50 p-5">
      <h4 className="mb-2 font-semibold text-stone-900">{title}</h4>
      <div className="space-y-2 text-base leading-relaxed text-stone-600">{children}</div>
    </div>
  );
}

/** A titled block of legal copy; pages declare these in a SECTIONS array. */
export interface LegalSectionData {
  title: string;
  body: React.ReactNode;
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section id={slugify(title)} className="mb-12 scroll-mt-28 last:mb-0">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-stone-700">{children}</div>
    </section>
  );
}

interface SummaryEntry {
  heading: string;
  text: string;
}

/** "Quick summary" box at the top of each legal page; entries split into two columns. */
export function QuickSummary({ entries }: { entries: SummaryEntry[] }) {
  const midpoint = Math.ceil(entries.length / 2);
  const columns = [entries.slice(0, midpoint), entries.slice(midpoint)];

  return (
    <div className="mb-12 rounded-xl bg-stone-50 p-6 md:p-8">
      <h2 className="mb-4 text-xl font-semibold text-stone-900">Quick summary</h2>
      <div className="grid gap-6 text-sm md:grid-cols-2">
        {columns.map((column, index) => (
          <div key={index} className="space-y-3">
            {column.map((entry) => (
              <div key={entry.heading}>
                <h4 className="mb-1 font-semibold text-stone-900">{entry.heading}</h4>
                <p className="text-stone-600">{entry.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mailto card used in the contact sections of both legal pages. */
export function EmailContactCard({ email, caption }: { email: string; caption: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-5">
      <TextLink href={`mailto:${email}`}>{email}</TextLink>
      <p className="mt-1.5 text-sm text-stone-500">{caption}</p>
    </div>
  );
}

interface LegalPageProps {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  /** The page's sections, in order; the "On this page" sidebar derives from their titles. */
  sections: LegalSectionData[];
  /** Rendered above the sections (e.g. the QuickSummary box). */
  children?: React.ReactNode;
}

/** Document-style shell for the Privacy Policy and Terms of Service pages. */
export default function LegalPage({
  metaTitle,
  metaDescription,
  title,
  subtitle,
  lastUpdated,
  sections,
  children,
}: LegalPageProps) {
  return (
    <Layout title={metaTitle} description={metaDescription}>
      <Container className="pb-24 md:pb-32">
        <Reveal>
          <header className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{subtitle}</p>
            <p className="mt-4 text-sm text-stone-500">Last updated: {lastUpdated}</p>
          </header>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-12 md:mt-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16"
        >
          {/* Sticky table of contents (desktop only) */}
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <h2 className="text-sm font-semibold text-stone-900">On this page</h2>
              <ul className="mt-3 space-y-2.5">
                {sections.map((section) => (
                  <li key={section.title}>
                    <a
                      href={`#${slugify(section.title)}`}
                      className="text-sm leading-snug text-stone-500 transition-colors duration-150 hover:text-stone-900"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="max-w-3xl">
            {children}
            {sections.map((section) => (
              <LegalSection key={section.title} title={section.title}>
                {section.body}
              </LegalSection>
            ))}
          </div>
        </Reveal>
      </Container>
    </Layout>
  );
}
