import { cn } from "@/lib/utils";
import React from "react";

interface ButtonUIProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const ButtonUI = ({
    children,
    onClick,
    disabled,
    className,
    variant = 'default',
    size = 'md'
}: ButtonUIProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                {
                    'bg-primary-600 text-white hover:bg-primary-700': variant === 'default',
                    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50': variant === 'outline',
                    'px-2 py-1 text-sm': size === 'sm',
                    'px-4 py-2': size === 'md',
                    'px-6 py-3': size === 'lg',
                },
                className
            )}
        >
            {children}
        </button>
    );
};