import LoadingSpinner from "./LoadingSpinner";

export const PageLoader = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center 
                    bg-white dark:bg-gray-900">
      <LoadingSpinner 
        size="lg" 
        fullScreen
        variant="primary"
      />
    </div>
  );
};