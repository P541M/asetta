import React, { ReactNode, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (e?: React.FormEvent) => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  icon?: ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  icon,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case "danger":
        return {
          button: "bg-light-error-text hover:bg-light-error-text/90 focus:ring-light-error-text dark:bg-dark-error-text dark:hover:bg-dark-error-text/90 dark:focus:ring-dark-error-text",
          icon: "text-light-error-text dark:text-dark-error-text",
        };
      case "warning":
        return {
          button: "bg-light-warning-text hover:bg-light-warning-text/90 focus:ring-light-warning-text dark:bg-dark-warning-text dark:hover:bg-dark-warning-text/90 dark:focus:ring-dark-warning-text",
          icon: "text-light-warning-text dark:text-dark-warning-text",
        };
      default:
        return {
          button: "bg-light-button-primary hover:bg-light-button-primary-hover focus:ring-light-button-primary dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover dark:focus:ring-dark-button-primary",
          icon: "text-light-button-primary dark:text-dark-button-primary",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-container w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`flex-shrink-0 ${variantClasses.icon}`}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
                {title}
              </h3>
              <div className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {message}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantClasses.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
