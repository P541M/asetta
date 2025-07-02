interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className = "" }: ErrorMessageProps) => {
  return (
    <div className={`p-4 bg-red-50 rounded-md text-red-700 animate-fade-in shadow-sm ${className}`}>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;