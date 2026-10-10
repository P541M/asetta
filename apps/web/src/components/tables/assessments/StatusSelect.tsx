import { ChevronDown, CircleCheck, CircleDashed, CircleX, Clock } from "lucide-react";
import { AssessmentStatus } from "@/types/assessment";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface StatusSelectProps {
  value: AssessmentStatus | null;
  onChange: (value: AssessmentStatus) => void;
  disabled?: boolean;
  /** `sm` = compact chip for desktop rows; `md` = full-width 44px control for mobile cards. */
  size?: "sm" | "md";
  className?: string;
  placeholder?: string;
}

const statusOptions: { value: AssessmentStatus; icon: typeof Clock }[] = [
  { value: "Not started", icon: CircleDashed },
  { value: "In progress", icon: Clock },
  { value: "Submitted", icon: CircleCheck },
  { value: "Missed", icon: CircleX },
];

/* Tinted chip per status (the bg-primary/10 text-primary recipe from standards.md);
   the neutral tint uses foreground/5 so it reads on any surface in both themes.
   The static map is shared with read-only status chips (NotesModal). */
export const statusTintClasses: Record<AssessmentStatus, string> = {
  "Not started": "bg-foreground/5 text-muted-foreground",
  "In progress": "bg-primary/10 text-primary",
  Submitted: "bg-success/10 text-success",
  Missed: "bg-destructive/10 text-destructive",
};

const chipHoverClasses: Record<AssessmentStatus, string> = {
  "Not started": "hover:bg-foreground/10",
  "In progress": "hover:bg-primary/15",
  Submitted: "hover:bg-success/15",
  Missed: "hover:bg-destructive/15",
};

const sizeClasses = {
  sm: "h-8 px-2.5 text-sm",
  md: "min-h-11 w-full px-4 text-sm",
};

/** Assessment status control: a tinted chip that opens a check-marked menu. */
const StatusSelect = ({
  value,
  onChange,
  disabled = false,
  size = "md",
  className,
  placeholder = "Set status",
}: StatusSelectProps) => {
  const SelectedIcon = statusOptions.find((option) => option.value === value)?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={value ? `Status: ${value}. Change status` : placeholder}
        className={cn(
          "inline-flex items-center justify-between gap-1.5 rounded-lg font-medium transition-colors outline-hidden",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[state=open]:ring-2 data-[state=open]:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          value ? statusTintClasses[value] : statusTintClasses["Not started"],
          value ? chipHoverClasses[value] : chipHoverClasses["Not started"],
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {SelectedIcon && <SelectedIcon className="size-4 shrink-0" aria-hidden />}
          <span className="truncate">{value ?? placeholder}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {statusOptions.map(({ value: option, icon: OptionIcon }) => (
          <DropdownMenuItem
            key={option}
            data-selected={value === option}
            onSelect={() => onChange(option)}
          >
            <OptionIcon aria-hidden />
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusSelect;
