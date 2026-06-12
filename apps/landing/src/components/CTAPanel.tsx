import { REGISTER_URL } from "@/lib/site";
import ButtonLink from "./Button";
import Container from "./Container";
import Reveal from "./Reveal";

interface CTAPanelProps {
  title: string;
  lead: string;
  buttonLabel?: string;
  buttonHref?: string;
  trackLabel?: string;
  /** Optional quiet text link rendered beside the primary button. */
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * The standardized closing call-to-action: a plain centered statement in
 * whitespace, closed by the stone footer band beneath it, so every page
 * ends the same way. Place it directly under the page's content, outside
 * any content container.
 */
export default function CTAPanel({
  title,
  lead,
  buttonLabel = "Get started",
  buttonHref = REGISTER_URL,
  trackLabel,
  secondaryLabel,
  secondaryHref,
}: CTAPanelProps) {
  return (
    <section className="mt-24 pb-24 md:mt-32 md:pb-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl">
            {lead}
          </p>
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
        </Reveal>
      </Container>
    </section>
  );
}
