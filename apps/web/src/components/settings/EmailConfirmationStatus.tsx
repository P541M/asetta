import { CircleCheck, Info } from "lucide-react";
import { Button } from "../ui/button";
import type { NotificationEmailStatus } from "../../utils/notificationEmail";
import type { ConfirmLinkRequest } from "../../lib/notificationEmailClient";
import { cn } from "../../lib/utils";

interface EmailConfirmationStatusProps {
  /** How the typed address stands (utils/notificationEmail.ts). */
  status: NotificationEmailStatus | null;
  accountEmail: string | null;
  /** The typed address is the one saved on the user doc, so a link can go to it. */
  saved: boolean;
  linkState: ConfirmLinkRequest | null;
  sending: boolean;
  onSendLink: () => void;
}

const LINK_FEEDBACK: Partial<Record<ConfirmLinkRequest, string>> = {
  sent: "Link sent. It can take a minute to arrive.",
  wait: "Please wait a bit before sending another link.",
  failed: "Couldn't send the link. Please try again.",
};

const captionClass = "flex items-start gap-2 text-xs font-medium text-muted-foreground";

/**
 * Where reminders go for the address in the Notifications card (A17): a chosen address gets them
 * only once its owner confirms it through the emailed link; until then they go to the account
 * email.
 */
const EmailConfirmationStatus = ({
  status,
  accountEmail,
  saved,
  linkState,
  sending,
  onSendLink,
}: EmailConfirmationStatusProps) => {
  if (status === "confirmed") {
    return (
      <p className={captionClass}>
        <CircleCheck className="mt-px size-3.5 shrink-0 text-success" aria-hidden />
        Confirmed. Reminders go to this address.
      </p>
    );
  }
  if (status !== "unconfirmed") return null;

  const fallback = accountEmail ? `reminders go to ${accountEmail}` : "no reminders go out";

  if (!saved) {
    return (
      <p className={captionClass}>
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        When you save, we&apos;ll email this address a link to confirm it. Until it&apos;s
        confirmed, {fallback}.
      </p>
    );
  }

  const feedback = linkState ? LINK_FEEDBACK[linkState] : undefined;
  return (
    <div className="space-y-1">
      <p className={captionClass}>
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        Not confirmed yet, so {fallback}. To confirm it, use the link we email to this address.
      </p>
      <div className="flex flex-wrap items-center gap-x-2">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="-ml-3"
          onClick={onSendLink}
          disabled={sending}
        >
          {sending ? "Sending..." : "Email me a link"}
        </Button>
        {!sending && feedback && (
          <p
            role="status"
            className={cn(
              "text-xs font-medium",
              linkState === "failed" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmationStatus;
