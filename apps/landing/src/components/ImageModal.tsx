import { useEffect } from "react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  title: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  title,
}: ImageModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 mx-4 animate-fade-in max-w-[95vw] max-h-[95vh] overflow-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-30 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-gray-300 hover:bg-black/70 transition-all duration-200"
          aria-label="Close image modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Container */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Title Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 md:p-6">
            <h3 className="text-white text-lg md:text-xl font-bold font-heading">
              {title}
            </h3>
          </div>

          {/* Full Resolution Image */}
          <div className="relative">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={0}
              height={0}
              sizes="100vw"
              className="w-auto h-auto max-w-none"
              style={{ maxWidth: "95vw", maxHeight: "95vh" }}
              priority
              unoptimized={imageSrc.endsWith(".gif")}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4">
          <p className="text-white/80 text-sm">
            Click outside or press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}
