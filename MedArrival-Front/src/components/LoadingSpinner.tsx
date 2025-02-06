// src/components/ui/loading-spinner.tsx
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    ghost: 'text-gray-400 dark:text-gray-600'
  };

  const Spinner = () => (
    <div
      className={cn(
        "relative inline-flex",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <div className="absolute w-full h-full rounded-full border-2 border-solid 
                      border-current border-r-transparent animate-spin" />
      <div className="absolute w-full h-full rounded-full border-2 border-solid 
                      border-current border-r-transparent animate-pulse opacity-30" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center 
                      bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

export default LoadingSpinner;