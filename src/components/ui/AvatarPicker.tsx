import IconPicker from "./IconPicker";
import Avatar from "./Avatar";
import { DEFAULT_ICON } from "../../data/profileIcons";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  selectedIconId?: string;
  onIconSelect: (iconId: string) => void;
  variant?: "inline" | "modal";
  className?: string;
}

const AvatarPicker = ({
  selectedIconId = DEFAULT_ICON.id,
  onIconSelect,
  variant = "inline",
  className,
}: AvatarPickerProps) => {
  const PreviewSection = () => (
    <div className="mb-4 flex items-center gap-4 rounded-xl bg-secondary/50 p-3">
      <span className="text-xs font-medium text-muted-foreground">Preview</span>
      <div className="flex items-center gap-2">
        <Avatar size="sm" iconId={selectedIconId} />
        <Avatar size="md" iconId={selectedIconId} />
        <Avatar size="lg" iconId={selectedIconId} />
      </div>
    </div>
  );

  const content = (
    <div className={cn("space-y-4", className)}>
      <PreviewSection />
      <IconPicker selectedIconId={selectedIconId} onIconSelect={onIconSelect} variant="inline" />
    </div>
  );

  if (variant === "modal") {
    return <div className="w-full max-w-md rounded-xl bg-card p-4 shadow-soft">{content}</div>;
  }

  return content;
};

export default AvatarPicker;
