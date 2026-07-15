import { CURATED_ICONS, IconData } from "../../data/profileIcons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  selectedIconId: string;
  onIconSelect: (iconId: string) => void;
  variant?: "inline" | "modal";
  className?: string;
}

const IconPicker = ({
  selectedIconId,
  onIconSelect,
  variant = "inline",
  className,
}: IconPickerProps) => {
  const IconGrid = ({ icons }: { icons: IconData[] }) => (
    <div className="grid max-h-64 grid-cols-6 gap-2 overflow-y-auto md:grid-cols-8">
      {icons.map((iconData) => {
        const IconComponent = iconData.icon;
        const isSelected = selectedIconId === iconData.id;
        return (
          <button
            key={iconData.id}
            type="button"
            onClick={() => onIconSelect(iconData.id)}
            title={iconData.name}
            aria-label={`Select ${iconData.name} icon`}
            aria-pressed={isSelected}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg outline-hidden transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-foreground hover:bg-accent",
            )}
          >
            <IconComponent className="size-5" aria-hidden />
          </button>
        );
      })}
    </div>
  );

  const content = (
    <div className={className}>
      <IconGrid icons={CURATED_ICONS} />
    </div>
  );

  if (variant === "modal") {
    return <div className="w-full max-w-sm rounded-xl bg-card p-4 shadow-soft">{content}</div>;
  }

  return content;
};

export default IconPicker;
