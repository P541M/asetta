import { REGISTER_URL } from "@/lib/site";
import ButtonLink from "./Button";
import Container from "./Container";
import Reveal from "./Reveal";

/** Highlight card used inside CTAPanel (e.g. "Always Free" / "Student-Centered"). */
export function CTAPanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 text-left">
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-base leading-relaxed text-stone-600">{children}</p>
    </div>
  );
}

interface CTAPanelProps {
  title: string;
  lead: string;
  buttonLabel?: string;
  buttonHref?: string;
  trackLabel?: string;
  /** Optional quiet text link rendered beside the primary button. */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Optional content rendered between the lead and the button (e.g. CTAPanelCards). */
  children?: React.ReactNode;
}

/**
 * The standardized closing call-to-action used on every page.
 * Self-contained: owns its width, surface, and vertical spacing so the
 * panel renders identically everywhere. Place it directly under the
 * page's content, outside any narrower content container.
 */
export default function CTAPanel({
  title,
  lead,
  buttonLabel = "Get started",
  buttonHref = REGISTER_URL,
  trackLabel,
  secondaryLabel,
  secondaryHref,
  children,
}: CTAPanelProps) {
  return (
    <Container as="section" className="mt-24 pb-24 md:mt-32 md:pb-32">
      <Reveal>
        <div className="rounded-2xl bg-stone-50 px-6 py-14 text-center md:px-12 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600">{lead}</p>
          {children && (
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-5 md:grid-cols-2">
              {children}
            </div>
          )}
          <div className="mt-8 flex items-center justify-center gap-2">
            <ButtonLink href={buttonHref} size="lg" withArrow trackLabel={trackLabel}>
              {buttonLabel}
            </ButtonLink>
            {secondaryLabel && secondaryHref && (
              <ButtonLink href={secondaryHref} variant="ghost" size="lg" withArrow>
                {secondaryLabel}
              </ButtonLink>
            )}
          </div>
        </div>
      </Reveal>
    </Container>
  );
}
