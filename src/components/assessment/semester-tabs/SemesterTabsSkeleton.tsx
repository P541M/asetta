/** Skeleton loading state that maintains consistent dimensions while semesters load. */
const SemesterTabsSkeleton = () => (
  <div className="semester-tabs-container mb-6">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-16 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded animate-pulse"></div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="h-7 w-7 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-md animate-pulse"></div>
        <div className="h-7 w-7 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-md animate-pulse"></div>
      </div>
    </div>

    {/* Skeleton tabs - horizontally scrollable */}
    <div className="relative px-4 py-2">
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 hide-scrollbar">
        {/* Skeleton tab pills */}
        <div className="h-8 w-20 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg animate-pulse flex-shrink-0"></div>
        <div className="h-8 w-24 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg animate-pulse flex-shrink-0"></div>
        <div className="h-8 w-18 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg animate-pulse flex-shrink-0"></div>
      </div>
    </div>
  </div>
);

export default SemesterTabsSkeleton;
