interface SkeletonLoaderProps {
  className?: string;
  rows?: number;
  type?: 'table' | 'card' | 'text' | 'calendar';
}

const SkeletonLoader = ({ 
  className = "", 
  rows = 3, 
  type = 'table' 
}: SkeletonLoaderProps) => {
  const baseClasses = "animate-pulse bg-light-border-primary dark:bg-dark-border-primary";

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 rounded-lg">
          <div className="col-span-2">
            <div className={`h-4 rounded ${baseClasses}`}></div>
          </div>
          <div className="col-span-2">
            <div className={`h-4 rounded ${baseClasses}`}></div>
          </div>
          <div className="col-span-4">
            <div className={`h-4 rounded ${baseClasses}`}></div>
          </div>
          <div className="col-span-4">
            <div className={`h-4 rounded ${baseClasses}`}></div>
          </div>
        </div>
        
        {/* Table rows */}
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded ${baseClasses}`}></div>
                  <div className={`h-6 w-20 rounded-full ${baseClasses}`}></div>
                </div>
                <div className="col-span-2">
                  <div className={`h-4 w-16 rounded ${baseClasses}`}></div>
                </div>
                <div className="col-span-4">
                  <div className={`h-4 w-full rounded ${baseClasses} mb-1`}></div>
                  <div className={`h-3 w-2/3 rounded ${baseClasses}`}></div>
                </div>
                <div className="col-span-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className={`h-4 w-24 rounded ${baseClasses}`}></div>
                    <div className={`h-3 w-16 rounded ${baseClasses}`}></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className={`h-8 w-8 rounded ${baseClasses}`}></div>
                    <div className={`h-8 w-8 rounded ${baseClasses}`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex items-start space-x-4">
              <div className={`h-12 w-12 rounded-lg ${baseClasses}`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-5 w-3/4 rounded ${baseClasses}`}></div>
                <div className={`h-4 w-1/2 rounded ${baseClasses}`}></div>
                <div className={`h-3 w-full rounded ${baseClasses}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'calendar') {
    return (
      <div className={`${className}`}>
        {/* Calendar header */}
        <div className="grid grid-cols-7 border-b dark:border-dark-border-primary bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="p-2 text-center">
              <div className={`h-4 w-8 mx-auto rounded ${baseClasses}`}></div>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-light-bg-primary dark:bg-dark-bg-secondary border-l border-t dark:border-dark-border-primary">
          {Array.from({ length: 42 }).map((_, index) => (
            <div key={index} className="relative p-2 min-h-[120px] border-r border-b dark:border-dark-border-primary">
              <div className={`h-4 w-6 rounded ${baseClasses} mb-2`}></div>
              <div className="space-y-1">
                {Math.random() > 0.7 && (
                  <div className={`h-6 w-full rounded ${baseClasses}`}></div>
                )}
                {Math.random() > 0.8 && (
                  <div className={`h-6 w-3/4 rounded ${baseClasses}`}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default text skeleton
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`h-4 rounded ${baseClasses}`} style={{ width: `${Math.random() * 40 + 60}%` }}></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;