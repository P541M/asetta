import { Check, Info, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SettingsActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  hasChanges: boolean;
  isSubmitting: boolean;
}

const SettingsActions = ({
  onCancel,
  onSubmit,
  hasChanges,
  isSubmitting,
}: SettingsActionsProps) => (
  <div className="mt-8 border-t border-border pt-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel and go back
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={!hasChanges || isSubmitting}
        className="sm:min-w-36"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="motion-safe:animate-spin" aria-hidden />
            Saving...
          </>
        ) : (
          <>
            <Check aria-hidden />
            Save changes
          </>
        )}
      </Button>
    </div>

    {hasChanges && (
      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Info className="size-3.5 shrink-0" aria-hidden />
        You have unsaved changes
      </p>
    )}
  </div>
);

export default SettingsActions;
