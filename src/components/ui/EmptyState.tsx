import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className = "" }: EmptyStateProps) => {
  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      <div className="mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
};

export default EmptyState;