import { NotificationPreferencesProps } from "../../types/preferences";
import { useState, useEffect } from "react";

const NotificationsSection = ({
  emailNotifications,
  setEmailNotifications,
  notificationDaysBefore,
  setNotificationDaysBefore,
  email,
  setEmail,
  setHasConsentedToNotifications,
}: Omit<NotificationPreferencesProps, 'hasConsentedToNotifications'>) => {
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState(notificationDaysBefore);

  // Update isCustomDays when notificationDaysBefore changes
  useEffect(() => {
    const isCustom = ![1, 2, 3, 7].includes(notificationDaysBefore);
    setIsCustomDays(isCustom);
    if (isCustom) {
      setCustomDays(notificationDaysBefore);
    }
  }, [notificationDaysBefore]);

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
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-light-border-primary dark:border-dark-border-primary pb-4">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-light-button-primary dark:text-dark-button-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="m13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Email Notifications
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Stay informed about upcoming assessment deadlines
        </p>
      </div>

      {/* Main Toggle Section */}
      <div className="flex items-center justify-between p-6 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            Email Notifications
          </h3>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Receive automated email reminders about upcoming assessment deadlines. You can customize when and how you receive these notifications below.
          </p>
          <div className="mt-3 flex items-center space-x-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your email is secure and will only be used for assessment notifications</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmailNotifications(!emailNotifications);
            setHasConsentedToNotifications(!emailNotifications); // Auto-sync consent
          }}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
            emailNotifications
              ? "bg-light-button-primary dark:bg-dark-button-primary"
              : "bg-light-border-secondary dark:bg-dark-border-secondary"
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
        <div className="space-y-6">
          {/* Email Configuration */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
              Email Configuration
            </h4>
            
            {/* Email Address */}
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
              >
                Notification Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200 placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
                placeholder="Enter your preferred email address"
              />

            </div>
          </div>

          {/* Notification Timing - always show when notifications enabled */}
          <div className="space-y-4">

              
              {/* Notification Days Before */}
              <div className="space-y-3">
                <label
                  htmlFor="notification-days"
                  className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
                >
                  Send notifications before due date
                </label>
                <select
                  id="notification-days"
                  value={
                    isCustomDays ? "custom" : notificationDaysBefore.toString()
                  }
                  onChange={(e) => handleDaysChange(e.target.value)}
                  className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200"
                >
                  <option value="1">1 day before due date</option>
                  <option value="2">2 days before due date</option>
                  <option value="3">3 days before due date</option>
                  <option value="7">1 week before due date</option>
                  <option value="custom">
                    {isCustomDays
                      ? `${customDays} days before due date`
                      : "Custom timing"}
                  </option>
                </select>


                {isCustomDays && (
                  <div className="mt-4 p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl border border-light-border-primary dark:border-dark-border-primary">
                    <label
                      htmlFor="custom-days"
                      className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
                    >
                      Custom number of days
                    </label>
                    <input
                      id="custom-days"
                      type="number"
                      min="1"
                      max="30"
                      value={customDays}
                      onChange={handleCustomDaysChange}
                      className="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary shadow-sm focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:border-light-button-primary dark:focus:border-dark-button-primary transition-all duration-200"
                      placeholder="Enter number of days"
                    />
                    <p className="mt-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      Choose between 1 and 30 days. Notifications will be sent daily at 9:00 PM.
                    </p>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}

      {!emailNotifications && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 17h5l-5 5v-5zM8.5 14v6m0 0V4m0 16l-3-3m3 3l3-3"
            />
          </svg>
          <h4 className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Email Notifications Disabled
          </h4>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary max-w-md mx-auto">
            Enable email notifications above to receive reminders about upcoming assessment deadlines and never miss an important due date.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
