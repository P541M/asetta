import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Feature } from "@/lib/features";
import ImageModal from "./ImageModal";
import Reveal from "./Reveal";
import { ZoomInIcon } from "./icons";

interface FeatureCardProps {
  feature: Feature;
  onZoom: () => void;
  /** Image-beside-text layout for wide tiles. */
  horizontal?: boolean;
  /** Eager-load the image (first tile can be the LCP above the fold). */
  eager?: boolean;
}

function ZoomOverlay() {
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-stone-950/0 transition-colors duration-200 group-hover:bg-stone-950/10">
      <span className="rounded-full bg-white/95 p-2.5 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
        <ZoomInIcon className="h-4 w-4 text-stone-700" />
      </span>
    </span>
  );
}

function FeatureCard({ feature, onZoom, horizontal = false, eager = false }: FeatureCardProps) {
  const image = (
    <button
      type="button"
      onClick={onZoom}
      aria-label={`View ${feature.title} preview in full size`}
      className={cn(
        "group relative w-full cursor-zoom-in overflow-hidden",
        horizontal ? "h-56 md:h-auto md:min-h-64 md:w-1/2" : "h-48 md:h-52",
      )}
    >
      <Image
        src={feature.image}
        alt={feature.title}
        fill
        loading={eager ? "eager" : undefined}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        unoptimized={feature.image.endsWith(".gif")}
      />
      <ZoomOverlay />
    </button>
  );

  return (
    <article
      className={cn(
        "flex h-full overflow-hidden rounded-xl bg-stone-50 transition-colors duration-200 hover:bg-stone-100",
        horizontal ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      {image}
      <div className={cn("flex grow flex-col p-6", horizontal && "justify-center md:w-1/2 md:p-8")}>
        <h3 className={cn("font-semibold text-stone-900", horizontal ? "text-xl" : "text-lg")}>
          {feature.title}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-stone-600">{feature.description}</p>
      </div>
    </article>
  );
}

type LayoutMode = "uniform" | "featured" | "bento";

/** Asymmetric spans for the six-tile bento; wide tiles render horizontally. */
const BENTO_SPANS = [
  "md:col-span-2 lg:col-span-4",
  "md:col-span-1 lg:col-span-2",
  "md:col-span-1 lg:col-span-2",
  "md:col-span-2 lg:col-span-4",
  "md:col-span-1 lg:col-span-3",
  "md:col-span-1 lg:col-span-3",
];
const BENTO_HORIZONTAL = new Set([0, 3]);

const CONTAINER_CLASSES: Record<LayoutMode, string> = {
  uniform: "md:grid-cols-2 lg:grid-cols-3",
  featured: "md:grid-cols-2",
  bento: "md:grid-cols-2 lg:grid-cols-6",
};

function itemClasses(layout: LayoutMode, index: number): string {
  if (layout === "featured") return index === 0 ? "md:col-span-2" : "";
  if (layout === "bento") return BENTO_SPANS[index % BENTO_SPANS.length];
  return "";
}

function isHorizontal(layout: LayoutMode, index: number): boolean {
  if (layout === "featured") return index === 0;
  if (layout === "bento") return BENTO_HORIZONTAL.has(index % BENTO_SPANS.length);
  return false;
}

interface FeatureGridProps {
  features: Feature[];
  /**
   * uniform: equal tiles. featured: first tile spans the full row (home).
   * bento: alternating wide/narrow rhythm (features page).
   */
  layout?: LayoutMode;
}

/** Responsive card grid for features, with a shared click-to-zoom modal. */
export default function FeatureGrid({ features, layout = "uniform" }: FeatureGridProps) {
  const [zoomed, setZoomed] = useState<Feature | null>(null);

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-5", CONTAINER_CLASSES[layout])}>
        {features.map((feature, index) => (
          <Reveal
            key={feature.title}
            delay={(index % 3) * 0.06}
            className={cn("h-full", itemClasses(layout, index))}
          >
            <FeatureCard
              feature={feature}
              onZoom={() => setZoomed(feature)}
              horizontal={isHorizontal(layout, index)}
              eager={index === 0}
            />
          </Reveal>
        ))}
      </div>

      <ImageModal
        isOpen={!!zoomed}
        onClose={() => setZoomed(null)}
        imageSrc={zoomed?.image ?? ""}
        imageAlt={zoomed?.title ?? ""}
        title={zoomed?.title ?? ""}
      />
    </>
  );
}
