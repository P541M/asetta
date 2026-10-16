import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Loader2, MailCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import AuthMessageBanner from "./AuthMessageBanner";
import { Button } from "../ui/button";
import { confirmAddress, type ConfirmAddressResult } from "../../lib/notificationEmailClient";

const COPY = {
  ready: {
    heading: "Confirm your email",
    subheading: "Confirm this address to get your Asetta reminders here.",
  },
  confirmed: {
    heading: "Email confirmed",
    subheading: "Your Asetta reminders will go to this address.",
  },
  expired: {
    heading: "This link has expired",
    subheading: "Send a new one from Settings, under Email notifications.",
  },
  invalid: {
    heading: "This link doesn't work",
    subheading:
      "It may have been used already, or a newer link replaced it. Send a new one from Settings.",
  },
};

/**
 * The page a notification address's confirm link opens (A17). Confirming takes a button press,
 * not the page load: mail scanners fetch links in emails, and a fetch must not confirm.
 */
const ConfirmEmail = () => {
  const router = useRouter();
  const [result, setResult] = useState<ConfirmAddressResult | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  // The link works once: a second click before the re-render would answer "invalid" last
  const inFlight = useRef(false);
  // The server renders the page without its query; on a URL without one, the router is ready
  // from the client's first render. Reading it only after mount keeps hydration matching.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { uid, token } = router.query;
  const hasLink =
    typeof uid === "string" && uid !== "" && typeof token === "string" && token !== "";
  const view =
    mounted && router.isReady && !hasLink
      ? "invalid"
      : result === "confirmed" || result === "expired" || result === "invalid"
        ? result
        : "ready";

  const handleConfirm = async () => {
    if (typeof uid !== "string" || typeof token !== "string" || inFlight.current) return;
    inFlight.current = true;
    setIsConfirming(true);
    const outcome = await confirmAddress(uid, token);
    setResult(outcome);
    setIsConfirming(false);
    // Only a failed request may be retried; any answer from the server is final
    inFlight.current = outcome !== "failed";
  };

  return (
    <AuthShell
      title="Asetta - Confirm Email"
      description="Confirm the address your Asetta reminders go to."
      heading={COPY[view].heading}
      subheading={COPY[view].subheading}
    >
      {view === "ready" && (
        <>
          {result === "failed" && (
            <AuthMessageBanner
              type="error"
              title="Couldn't confirm your email"
              text="Please try again."
            />
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={!mounted || !router.isReady || isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Confirming...
              </>
            ) : (
              "Confirm email"
            )}
          </Button>
        </>
      )}

      {view === "confirmed" && (
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
            <MailCheck className="size-6 text-success" aria-hidden />
          </div>
          <Button size="lg" className="mt-8 w-full" onClick={() => router.push("/dashboard")}>
            Open Asetta
          </Button>
        </div>
      )}

      {(view === "expired" || view === "invalid") && (
        <Button size="lg" className="w-full" onClick={() => router.push("/settings")}>
          Open Settings
        </Button>
      )}
    </AuthShell>
  );
};

export default ConfirmEmail;
