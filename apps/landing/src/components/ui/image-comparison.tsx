import { createContext, useContext, useState } from "react";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

// Spring-smoothed slider position (0-100), shared with the image and handle parts.
const ImageComparisonContext = createContext<MotionValue<number> | undefined>(undefined);

function useSliderPosition(): MotionValue<number> {
  const sliderPosition = useContext(ImageComparisonContext);
  if (!sliderPosition) {
    throw new Error("ImageComparison parts must be rendered inside <ImageComparison>");
  }
  return sliderPosition;
}

const SPRING_OPTIONS = { bounce: 0, duration: 0 };

function ImageComparison({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const motionValue = useMotionValue(50);
  const sliderPosition = useSpring(motionValue, SPRING_OPTIONS);

  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const containerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x =
      "touches" in event
        ? event.touches[0].clientX - containerRect.left
        : event.clientX - containerRect.left;

    motionValue.set(Math.min(Math.max((x / containerRect.width) * 100, 0), 100));
  };

  return (
    <ImageComparisonContext.Provider value={sliderPosition}>
      <div
        className={cn("relative select-none overflow-hidden", className)}
        onMouseMove={handleDrag}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleDrag}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  );
}

const ImageComparisonImage = ({
  className,
  alt,
  src,
  position,
}: {
  className?: string;
  alt: string;
  src: string;
  position: "left" | "right";
}) => {
  const sliderPosition = useSliderPosition();
  const clipPath = useTransform(sliderPosition, (value) =>
    position === "left" ? `inset(0 0 0 ${value}%)` : `inset(0 ${100 - value}% 0 0)`,
  );

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{ clipPath }}
    />
  );
};

const ImageComparisonSlider = ({
  className,
  children,
}: {
  className: string;
  children?: React.ReactNode;
}) => {
  const sliderPosition = useSliderPosition();
  const left = useTransform(sliderPosition, (value) => `${value}%`);

  return (
    <motion.div
      className={cn("absolute bottom-0 top-0 w-1 cursor-ew-resize", className)}
      style={{ left }}
    >
      {children}
    </motion.div>
  );
};

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider };
