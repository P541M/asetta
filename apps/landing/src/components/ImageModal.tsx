import { useEffect } from "react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  title: string;
}

/** Full-size lightbox for feature previews. Closes on Escape or backdrop click. */
export default function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  title,
}: ImageModalProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-fade-in relative z-10 mx-4 max-h-[95vh] max-w-[95vw] overflow-auto">
        <button
          onClick={onClose}
          aria-label="Close image preview"
          className="fixed right-4 top-4 z-30 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-black/70"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Title overlay */}
          <div className="absolute inset-x-0 top-0 z-10 bg-linear-to-b from-black/70 to-transparent p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3>
          </div>

          <Image
            src={imageSrc}
            alt={imageAlt}
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-auto max-w-none"
            style={{ maxWidth: "95vw", maxHeight: "95vh" }}
            priority
            unoptimized={imageSrc.endsWith(".gif")}
          />
        </div>
      </div>
    </div>
  );
}
