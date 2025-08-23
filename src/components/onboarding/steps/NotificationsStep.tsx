import React, { useState, useEffect } from "react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { StepNavigation } from "../ui/StepNavigation";

export function NotificationsStep() {
  const { state, updateUserData } = useOnboarding();
  const [formData, setFormData] = useState({
    emailNotifications: state.userData.emailNotifications || false,
    notificationDaysBefore: state.userData.notificationDaysBefore || 3,
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
    const value = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
    setCustomDays(value);
    const newFormData = { ...formData, notificationDaysBefore: value };
    setFormData(newFormData);
    updateUserData(newFormData);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canContinue = !formData.emailNotifications || 
    (formData.emailNotifications && isValidEmail(formData.email));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-light-button-primary/10 dark:bg-dark-button-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-light-button-primary dark:text-dark-button-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="m13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          Never miss a deadline
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Set up email notifications to stay on top of your assessments.
        </p>
      </div>

      {/* Main Toggle Section */}
      <div className="flex items-center justify-between p-6 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-hover-primary dark:hover:bg-dark-hover-primary transition-all duration-200 border border-light-border-primary dark:border-dark-border-primary mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            Email Notifications
          </h3>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Receive automated email reminders about upcoming assessment deadlines to help you stay organized and never miss important due dates.
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
          onClick={() => handleInputChange("emailNotifications", !formData.emailNotifications)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary focus:ring-offset-2 ${
            formData.emailNotifications
              ? "bg-light-button-primary dark:bg-dark-button-primary"
              : "bg-light-border-secondary dark:bg-dark-border-secondary"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              formData.emailNotifications ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {formData.emailNotifications && (
        <div className="space-y-6">
          {/* Email Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Email Configuration
            </h3>
            
            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Notification Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input"
                placeholder="Enter your preferred email address"
                required
              />

              {formData.email && !isValidEmail(formData.email) && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>
          </div>

          {/* Notification Timing - always show when notifications enabled */}
          <div className="space-y-4">

              
              {/* Notification Days Before */}
              <div className="form-group">
                <label htmlFor="notification-days" className="form-label">
                  Send notifications before due date
                </label>
                <select
                  id="notification-days"
                  value={isCustomDays ? "custom" : formData.notificationDaysBefore.toString()}
                  onChange={(e) => handleDaysChange(e.target.value)}
                  className="input"
                >
                  <option value="1">1 day before due date</option>
                  <option value="2">2 days before due date</option>
                  <option value="3">3 days before due date (recommended)</option>
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
                      className="input"
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

      {!formData.emailNotifications && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⏰</div>
          <h4 className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Stay organized with reminders
          </h4>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary max-w-md mx-auto">
            Enable notifications above to receive reminders about upcoming assessment deadlines. You can always change this later in your settings.
          </p>
        </div>
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