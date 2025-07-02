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
    <div className={`text-center py-12 ${className}`}>
      {icon}
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;