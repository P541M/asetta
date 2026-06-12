import Reveal from "./Reveal";

interface SectionHeadingProps {
  title: React.ReactNode;
  lead?: string;
  /**
   * center: stacked and centered (CTAs, symmetric sections).
   * split: editorial two-column header (title left, lead right) for content sections.
   */
  align?: "center" | "split";
}

/** Heading block used at the top of in-page sections. */
export default function SectionHeading({ title, lead, align = "center" }: SectionHeadingProps) {
  if (align === "split") {
    return (
      <Reveal className="mb-12 md:mb-16">
        <div className="grid gap-4 md:grid-cols-2 md:items-end md:gap-12">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            {title}
          </h2>
          {lead && (
            <p className="max-w-md text-lg leading-relaxed text-stone-600 md:justify-self-end md:text-xl">
              {lead}
            </p>
          )}
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {lead && (
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl">
          {lead}
        </p>
      )}
    </Reveal>
  );
}
