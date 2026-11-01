import type { DynamicOptionsLoadingProps } from "next/dynamic";
import { CircleAlert } from "lucide-react";
import { Button } from "./button";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";

interface ChunkLoadingProps extends DynamicOptionsLoadingProps {
  /** What is loading, as the error names it: "tab", "step". */
  part: string;
}

/**
 * A `next/dynamic` part still loading: nothing for the first 200 ms (nearly every load), then the
 * spinner. A fetch that fails shows an error with "Try again".
 */
const ChunkLoading = ({ error, pastDelay, retry, part }: ChunkLoadingProps) => {
  if (error) {
    return (
      <EmptyState
        icon={CircleAlert}
        title={`Couldn't load this ${part}`}
        description="Check your internet connection, then try again."
        action={
          <Button type="button" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }
  if (!pastDelay) return null;
  return (
    <div className="flex justify-center py-16">
      <LoadingSpinner />
    </div>
  );
};

export default ChunkLoading;
