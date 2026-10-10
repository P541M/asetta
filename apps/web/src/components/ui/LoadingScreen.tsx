/** Full-screen centered spinner shown while auth/data is loading. */
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export default LoadingScreen;
