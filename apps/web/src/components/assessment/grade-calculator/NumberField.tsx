import { useEffect, useRef, useState } from "react";
import { Input } from "../../ui/input";

interface NumberFieldProps {
  /** Canonical numeric state (parsed/clamped by the parent); null renders empty. */
  value: number | null;
  /** Raw text on each keystroke; the parent parses, clamps, and persists. */
  onRawChange: (raw: string) => void;
  /** Called when the field is left (blur, or Enter, which blurs it), for a parent that saves then. */
  onCommit?: () => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Numeric input that owns its raw text while focused: the parent keeps
 * parsed/clamped numbers, but reformatting never fights the caret (the
 * cursor-jump class of bug: a controlled value like "12." re-rendering as
 * "12" resets the browser's caret). Text snaps to the canonical number on
 * blur; external updates (auto-save echoes, course switches) are adopted
 * only while the field is idle.
 */
const NumberField = ({ value, onRawChange, onCommit, ...props }: NumberFieldProps) => {
  const [text, setText] = useState(value === null ? "" : String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(value === null ? "" : String(value));
    }
  }, [value]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setText(value === null ? "" : String(value));
        onCommit?.();
      }}
      onKeyDown={(e) => {
        if (onCommit && e.key === "Enter") e.currentTarget.blur();
      }}
      onChange={(e) => {
        setText(e.target.value);
        onRawChange(e.target.value);
      }}
    />
  );
};

export default NumberField;
