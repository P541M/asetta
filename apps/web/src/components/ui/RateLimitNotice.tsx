import { useState, useEffect } from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "./button";

interface RateLimitNoticeProps {
  onRetry: () => void;
  retryAfter?: number; // seconds
  autoRetry?: boolean;
}

const RateLimitNotice = ({ onRetry, retryAfter = 120, autoRetry = true }: RateLimitNoticeProps) => {
  const [countdown, setCountdown] = useState(retryAfter);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRetry && countdown === 0 && !isRetrying) {
      setIsRetrying(true);
      onRetry();
    }
  }, [countdown, autoRetry, onRetry, isRetrying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleManualRetry = () => {
    setIsRetrying(true);
    onRetry();
  };

  return (
    <div className="rounded-xl bg-muted p-5">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Servers temporarily busy</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our AI processing servers are handling a high volume of requests. This is normal
              during peak times and resolves shortly.
            </p>
          </div>

          {countdown > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-full rounded-full bg-foreground/10">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${((retryAfter - countdown) / retryAfter) * 100}%` }}
                  />
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                  {formatTime(countdown)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {autoRetry ? "Auto-retrying in" : "Please wait"} {formatTime(countdown)}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? "Retrying..." : "Try now"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
              Retrying your request...
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Why is this happening?</span> We share AI processing
            resources across all users to keep the service free. During busy periods we may hit rate
            limits, but service typically resumes within 1-2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateLimitNotice;
