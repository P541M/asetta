import { Switch } from "../ui/switch";

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

/** A tonal row with a heading, description, and a switch on the right. */
const ToggleRow = ({ title, description, checked, onCheckedChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
    <div className="flex-1">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
  </div>
);

export default ToggleRow;
