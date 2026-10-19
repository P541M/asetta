import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";

/** Inline error banner for tab content (padded to sit inside the panel). */
const TabError = ({ message }: { message: string }) => (
  <div className="p-6">
    <Alert variant="destructive">
      <CircleAlert aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
);

export default TabError;
