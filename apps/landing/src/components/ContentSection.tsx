import Reveal from "./Reveal";

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Plain prose section used on content pages: whitespace over boxes. */
export default function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <Reveal>
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone-700">{children}</div>
      </section>
    </Reveal>
  );
}
