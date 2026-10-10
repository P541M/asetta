import { useEffect, useId, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { COURSE_COLOR_PRESETS, isValidCourseColor } from "../../constants/courseColors";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface CourseColorPickerProps {
  /** Current "#RRGGBB" hex. */
  value: string;
  /** Commit callback — always receives a valid, uppercased "#RRGGBB". */
  onSelect: (color: string) => void;
  /** Names the trigger for screen readers, e.g. `Change color for CS 101`. */
  ariaLabel: string;
  /**
   * Trigger style: `field` reads like a filled form control (swatch + hex
   * text); `swatch` is the compact square for dense rows.
   */
  variant?: "field" | "swatch";
  className?: string;
}

/* Drag-commit debounce: long enough to collapse a drag into one Firestore
   write, short enough that other surfaces feel live. */
const COMMIT_DELAY_MS = 400;

/**
 * The course color picker (standards.md v4.3): a form-native trigger opening
 * a popover with a saturation canvas + hue slider (react-colorful), a hex
 * field, and preset quick-picks. Instant-apply: drags commit debounced,
 * presets and valid hex entry commit immediately, close flushes any pending
 * commit. Never a native OS color input.
 */
const CourseColorPicker = ({
  value,
  onSelect,
  ariaLabel,
  variant = "field",
  className,
}: CourseColorPickerProps) => {
  const hexInputId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hexText, setHexText] = useState(value);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const flushPending = () => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    if (pendingRef.current) {
      onSelectRef.current(pendingRef.current);
      pendingRef.current = null;
    }
  };

  // Unmount (e.g. the rename editor closes) must not lose an in-flight drag
  useEffect(() => flushPending, []);

  const commitNow = (hex: string) => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    pendingRef.current = null;
    setDraft(hex);
    setHexText(hex);
    onSelectRef.current(hex);
  };

  const commitDebounced = (hex: string) => {
    setDraft(hex);
    setHexText(hex);
    pendingRef.current = hex;
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      commitTimer.current = null;
      pendingRef.current = null;
      onSelectRef.current(hex);
    }, COMMIT_DELAY_MS);
  };

  const handleHexInput = (raw: string) => {
    setHexText(raw);
    const candidate = (raw.startsWith("#") ? raw : `#${raw}`).toUpperCase();
    if (isValidCourseColor(candidate)) {
      commitNow(candidate);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value);
      setHexText(value);
    } else {
      flushPending();
    }
  };

  /* While the popover is open the trigger echoes the live draft — commits to
     Firestore stay debounced, but the preview must never lag the drag. */
  const displayColor = open ? draft : value;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {variant === "field" ? (
          <button
            type="button"
            aria-label={ariaLabel}
            className={cn(
              "flex h-11 items-center gap-2 rounded-lg bg-input px-3 outline-hidden md:h-9",
              "transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-sm ring-1 ring-inset ring-foreground/10"
              style={{ backgroundColor: displayColor }}
            />
            <span className="font-mono text-sm text-foreground">{displayColor}</span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={ariaLabel}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg outline-hidden md:size-9",
              "transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <span
              aria-hidden
              className="size-4 rounded-sm ring-1 ring-inset ring-foreground/10"
              style={{ backgroundColor: displayColor }}
            />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="course-color-picker"
        /* Escape must close only the popover, not the editor hosting it;
           Radix closes via its own document listener before this runs */
        onKeyDown={(e) => {
          if (e.key === "Escape") e.stopPropagation();
        }}
      >
        <HexColorPicker color={draft} onChange={(hex) => commitDebounced(hex.toUpperCase())} />

        <div className="mt-3 flex items-center gap-2">
          <Label htmlFor={hexInputId} className="text-xs font-medium text-muted-foreground">
            Hex
          </Label>
          <Input
            id={hexInputId}
            value={hexText}
            onChange={(e) => handleHexInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            maxLength={7}
            className="h-9 font-mono text-sm uppercase"
            aria-label="Hex color value"
          />
        </div>

        <div className="mt-3 flex items-center gap-1.5" role="group" aria-label="Preset colors">
          {COURSE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`Use preset ${preset}`}
              onClick={() => commitNow(preset)}
              className="flex size-8 items-center justify-center rounded-lg outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="size-4 rounded-sm ring-1 ring-inset ring-foreground/10"
                style={{ backgroundColor: preset }}
              />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CourseColorPicker;
