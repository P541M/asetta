import { useState, useEffect } from "react";
import { BellOff, ChevronsUpDown, Info, Lock } from "lucide-react";
import { NotificationsSectionProps } from "../../types/preferences";
import { isValidEmail } from "../../utils/validation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EmptyState from "../ui/EmptyState";

const timingOptions = [
  { value: "1", label: "1 day before due date" },
  { value: "2", label: "2 days before due date" },
  { value: "3", label: "3 days before due date (recommended)" },
  { value: "7", label: "1 week before due date" },
];

const NotificationsSection = ({ form, onChange }: NotificationsSectionProps) => {
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState(form.notificationDaysBefore);

  // Update isCustomDays when notificationDaysBefore changes
  useEffect(() => {
    const isCustom = ![1, 2, 3, 7].includes(form.notificationDaysBefore);
    setIsCustomDays(isCustom);
    if (isCustom) {
      setCustomDays(form.notificationDaysBefore);
    }
  }, [form.notificationDaysBefore]);

  const handleDaysChange = (value: string) => {
    if (value === "custom") {
      setIsCustomDays(true);
      onChange("notificationDaysBefore", customDays);
    } else {
      setIsCustomDays(false);
      onChange("notificationDaysBefore", Number(value));
    }
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only digits
    if (inputValue && !/^\d+$/.test(inputValue)) {
      return;
    }

    setCustomDays(inputValue ? parseInt(inputValue) : 1);
  };

  const handleCustomDaysBlur = () => {
    const value = Math.max(1, Math.min(30, customDays || 1));
    setCustomDays(value);
    onChange("notificationDaysBefore", value);
  };

  const selectedTiming = isCustomDays
    ? `Custom (${customDays} day${customDays !== 1 ? "s" : ""})`
    : (timingOptions.find((option) => option.value === form.notificationDaysBefore.toString())
        ?.label ?? "Select timing");

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-semibold text-foreground">Email notifications</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay informed about upcoming assessment deadlines
        </p>
      </div>

      {/* Main toggle */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-6">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground">Email notifications</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive automated email reminders about upcoming assessment deadlines. You can customize
            when and how you receive these notifications below.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            Your email is secure and will only be used for assessment notifications
          </p>
        </div>
        <Switch
          checked={form.emailNotifications}
          onCheckedChange={(checked) => onChange("emailNotifications", checked)}
          aria-label="Email notifications"
        />
      </div>

      {form.emailNotifications && (
        <div className="space-y-6">
          {/* Email address */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Notification email address</Label>
            <Input
              type="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Enter your preferred email address"
            />

            {form.email && !isValidEmail(form.email) && (
              <p className="text-sm text-destructive">Please enter a valid email address</p>
            )}

            {form.email && isValidEmail(form.email) && (
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Info className="size-3.5 shrink-0" aria-hidden />
                Reminder: Notifications might end up in your spam folder
              </p>
            )}
          </div>

          {/* Timing */}
          <div className="space-y-1.5">
            <Label id="notification-days-label">Send notifications before due date</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-between"
                  aria-labelledby="notification-days-label"
                >
                  <span className="truncate">{selectedTiming}</span>
                  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-64">
                {timingOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    data-selected={
                      !isCustomDays && form.notificationDaysBefore.toString() === option.value
                    }
                    onSelect={() => handleDaysChange(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  data-selected={isCustomDays}
                  onSelect={() => handleDaysChange("custom")}
                >
                  {isCustomDays ? `Custom (${customDays} days)` : "Custom timing"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isCustomDays && (
              <div className="mt-4 space-y-1.5 rounded-xl bg-secondary/50 p-4">
                <Label htmlFor="custom-days">Custom number of days</Label>
                <Input
                  id="custom-days"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customDays}
                  onChange={handleCustomDaysChange}
                  onBlur={handleCustomDaysBlur}
                  placeholder="Enter number of days (1-30)"
                />
                <p className="pt-1 text-sm text-muted-foreground">
                  Choose between 1 and 30 days. Notifications will be sent daily at 9:00 PM.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!form.emailNotifications && (
        <EmptyState
          icon={BellOff}
          title="Email notifications disabled"
          description="Enable email notifications above to receive reminders about upcoming assessment deadlines and never miss an important due date."
        />
      )}
    </div>
  );
};

export default NotificationsSection;
