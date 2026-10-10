import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SettingsActionsProps {
  dirty: boolean;
  saving: boolean;
}

/** Per-card save footer: submit enabled only while the card's form is dirty. */
const SettingsActions = ({ dirty, saving }: SettingsActionsProps) => (
  <div className="mt-8 flex justify-end border-t border-border pt-6">
    <Button type="submit" disabled={!dirty || saving} className="sm:min-w-36">
      {saving ? (
        <>
          <Loader2 className="motion-safe:animate-spin" aria-hidden />
          Saving...
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  </div>
);

export default SettingsActions;
