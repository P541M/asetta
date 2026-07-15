import React, { useState, useEffect } from "react";
import { Bell, Check, ChevronsUpDown, Info, Lock } from "lucide-react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import EmptyState from "../../ui/EmptyState";

const timingOptions = [
  { value: "1", label: "1 day before due date" },
  { value: "2", label: "2 days before due date" },
  { value: "3", label: "3 days before due date (recommended)" },
  { value: "7", label: "1 week before due date" },
];

export function NotificationsStep() {
  const { state, updateUserData } = useOnboarding();
  const [formData, setFormData] = useState({
    emailNotifications: state.userData.emailNotifications || false,
    notificationDaysBefore: state.userData.notificationDaysBefore || 1,
    email: state.userData.email || "",
  });
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState(formData.notificationDaysBefore);

  // Update isCustomDays when notificationDaysBefore changes
  useEffect(() => {
    const isCustom = ![1, 2, 3, 7].includes(formData.notificationDaysBefore);
    setIsCustomDays(isCustom);
    if (isCustom) {
      setCustomDays(formData.notificationDaysBefore);
    }
  }, [formData.notificationDaysBefore]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-sync consent with email notifications
    const userData = {
      ...newFormData,
      hasConsentedToNotifications: newFormData.emailNotifications,
    };

    setFormData(newFormData);
    updateUserData(userData);
  };

  const handleDaysChange = (value: string) => {
    if (value === "custom") {
      setIsCustomDays(true);
      const newFormData = { ...formData, notificationDaysBefore: customDays };
      setFormData(newFormData);
      updateUserData(newFormData);
    } else {
      setIsCustomDays(false);
      const dayValue = Number(value);
      const newFormData = { ...formData, notificationDaysBefore: dayValue };
      setFormData(newFormData);
      updateUserData(newFormData);
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
    const newFormData = { ...formData, notificationDaysBefore: value };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canContinue =
    !formData.emailNotifications || (formData.emailNotifications && isValidEmail(formData.email));

  const selectedTiming = isCustomDays
    ? `Custom (${customDays} day${customDays !== 1 ? "s" : ""})`
    : (timingOptions.find((option) => option.value === formData.notificationDaysBefore.toString())
        ?.label ?? "Select timing");

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <Bell className="size-8 text-primary" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Never miss a deadline
        </h2>
        <p className="text-muted-foreground">
          Set up email notifications to stay on top of your assessments.
        </p>
      </div>

      {/* Main toggle section */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-6">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Email notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive automated email reminders about upcoming assessment deadlines to help you stay
            organized and never miss important due dates.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            Your email is secure and will only be used for assessment notifications
          </p>
        </div>
        <Switch
          checked={formData.emailNotifications}
          onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
          aria-label="Email notifications"
        />
      </div>

      {formData.emailNotifications && (
        <div className="space-y-6">
          {/* Email configuration */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Notification email address <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your preferred email address"
              required
            />

            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-sm text-destructive">Please enter a valid email address</p>
            )}

            {formData.email && isValidEmail(formData.email) && (
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Info className="size-3.5 shrink-0" aria-hidden />
                Reminder: Notifications might end up in your spam folder
              </p>
            )}
          </div>

          {/* Notification timing */}
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
                    onSelect={() => handleDaysChange(option.value)}
                  >
                    <Check
                      className={cn(
                        !isCustomDays && formData.notificationDaysBefore.toString() === option.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                      aria-hidden
                    />
                    {option.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onSelect={() => handleDaysChange("custom")}>
                  <Check className={cn(isCustomDays ? "opacity-100" : "opacity-0")} aria-hidden />
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

      {!formData.emailNotifications && (
        <EmptyState
          icon={<Bell className="size-12" aria-hidden />}
          title="Stay organized with reminders"
          description="Enable notifications above to receive reminders about upcoming assessment deadlines. You can always change this later in your settings."
          className="py-8"
        />
      )}

      <StepNavigation
        canGoNext={canContinue}
        nextLabel="Continue"
        showSkip={true}
        skipLabel="Skip for now"
      />
    </div>
  );
}
