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
          button: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
          icon: "text-red-500",
        };
      case "warning":
        return {
          button: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500",
          icon: "text-yellow-500",
        };
      default:
        return {
          button: "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500",
          icon: "text-primary-500",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[9999] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-lg w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`flex-shrink-0 ${variantClasses.icon}`}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">
                {title}
              </h3>
              <div className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                {message}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-bg-primary transition-colors ${variantClasses.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
