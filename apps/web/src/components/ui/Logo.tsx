import Image from "next/image";

/**
 * The Asetta wordmark. font-extrabold is the brand mark (shared with the
 * landing), deliberately outside the app's two-weight rule.
 */
const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative size-7 shrink-0">
      <Image
        src="/images/Asetta_Logo.svg"
        alt="Asetta logo"
        width={80}
        height={80}
        className="filter-primary-main h-full w-full object-contain"
        priority
      />
    </div>
    <span className="text-xl font-extrabold tracking-tight text-foreground">Asetta</span>
  </div>
);

export default Logo;
