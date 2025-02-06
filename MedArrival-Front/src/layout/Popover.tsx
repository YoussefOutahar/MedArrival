import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

function Popover({ isOpen, onClose, children, className, side = 'bottom' }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "absolute z-50",
        sideClasses[side],
        "bg-white dark:bg-gray-800",
        "rounded-lg shadow-lg",
        "border border-gray-200 dark:border-gray-700",
        "py-2",
        "animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export default Popover;