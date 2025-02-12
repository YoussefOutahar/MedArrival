import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { forwardRef } from "react";

interface ConfirmPopupProps {
  message: string;
  onConfirm: () => void;
  isOpen: boolean;
  onClose: (value: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

export const ConfirmPopup = forwardRef<HTMLButtonElement, ConfirmPopupProps>(({
  message,
  onConfirm,
  isOpen,
  onClose,
  title = "Confirm Action",
  children
}, ref) => {
  const handleConfirm = () => {
    onConfirm();
    onClose(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={(e) => onClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

ConfirmPopup.displayName = "ConfirmPopup";
