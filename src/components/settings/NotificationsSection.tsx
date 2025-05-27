import { NotificationPreferencesProps } from "../../types/preferences";
import { useState } from "react";

const NotificationsSection = ({
  emailNotifications,
  setEmailNotifications,
  notificationDaysBefore,
  setNotificationDaysBefore,
  email,
  setEmail,
  hasConsentedToNotifications,
  setHasConsentedToNotifications,
}: NotificationPreferencesProps) => {
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState(notificationDaysBefore);

  const handleDaysChange = (value: string) => {
    if (value === "custom") {
      setIsCustomDays(true);
      setNotificationDaysBefore(customDays);
    } else {
      setIsCustomDays(false);
      setNotificationDaysBefore(Number(value));
    }
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
    setCustomDays(value);
    setNotificationDaysBefore(value);
  };

  return (
    <div className="space-y-6">
      {/* Consent Checkbox */}
      <div className="mb-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notification-consent"
              type="checkbox"
              checked={hasConsentedToNotifications}
              onChange={(e) => setHasConsentedToNotifications(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="notification-consent"
              className="font-medium text-gray-700 dark:text-dark-text-primary"
            >
              I consent to receive notifications about upcoming due dates
            </label>
            <p className="text-gray-500 dark:text-dark-text-tertiary">
              By enabling notifications, you agree to receive reminders about
              upcoming assessments via email.
            </p>
          </div>
        </div>
      </div>

      {hasConsentedToNotifications && (
        <>
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
                Email Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
                Receive notifications via email
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                emailNotifications
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-dark-bg-tertiary"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  emailNotifications ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {emailNotifications && (
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
                placeholder="Enter your email address"
              />
            </div>
          )}

          {/* Notification Days Before */}
          <div className="mb-4">
            <label
              htmlFor="notification-days"
              className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1"
            >
              Notify me
            </label>
            <select
              id="notification-days"
              value={
                isCustomDays ? "custom" : notificationDaysBefore.toString()
              }
              onChange={(e) => handleDaysChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
            >
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="custom">Custom number of days</option>
            </select>

            {isCustomDays && (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={handleCustomDaysChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-input-bg dark:text-dark-input-text transition-all duration-200"
                  placeholder="Enter number of days (1-30)"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
                  Choose between 1 and 30 days
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsSection;
