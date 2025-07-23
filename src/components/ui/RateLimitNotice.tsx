import { useState, useEffect } from "react";

interface RateLimitNoticeProps {
  onRetry: () => void;
  retryAfter?: number; // seconds
  autoRetry?: boolean;
}

const RateLimitNotice = ({ 
  onRetry, 
  retryAfter = 120, 
  autoRetry = true 
}: RateLimitNoticeProps) => {
  const [countdown, setCountdown] = useState(retryAfter);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRetry && countdown === 0 && !isRetrying) {
      setIsRetrying(true);
      onRetry();
    }
  }, [countdown, autoRetry, onRetry, isRetrying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleManualRetry = () => {
    setIsRetrying(true);
    onRetry();
  };

  return (
    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg animate-fade-in">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-amber-600 dark:text-amber-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            {countdown > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">
            Servers Temporarily Busy
          </h3>
          
          <p className="text-amber-700 dark:text-amber-400 mb-4">
            Our AI processing servers are currently handling a high volume of requests. 
            This is normal during peak usage times and will resolve shortly.
          </p>
          
          {countdown > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-amber-200 dark:bg-amber-800/30 rounded-full h-2">
                  <div 
                    className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((retryAfter - countdown) / retryAfter) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
                  {formatTime(countdown)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  {autoRetry ? "Auto-retrying in" : "Please wait"} {formatTime(countdown)}
                </p>
                
                <button
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? "Retrying..." : "Try Now"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                Retrying your request...
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-800/30 rounded-md">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Why is this happening?</strong> We share AI processing resources across all users to keep the service free. 
          During busy periods, we may hit rate limits but service typically resumes within 1-2 minutes.
        </p>
      </div>
    </div>
  );
};

export default RateLimitNotice;