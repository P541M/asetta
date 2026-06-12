import Reveal from "./Reveal";

interface PageHeroProps {
  title: React.ReactNode;
  subtitle: string;
}

/** Centered intro block used at the top of every inner page. */
export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <Reveal className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl">
        {subtitle}
      </p>
    </Reveal>
  );
}
