export function FormButton({
    type = 'button',
    variant = 'primary',
    disabled = false,
    isLoading = false,
    onClick,
    children,
}: {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}) {
    const baseStyles = "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 " +
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 " +
                      "disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary-600 dark:bg-primary-500 text-white " +
                "hover:bg-primary-700 dark:hover:bg-primary-600 " +
                "focus:ring-primary-500 dark:focus:ring-primary-400",
        secondary: "border border-gray-300 dark:border-gray-600 " +
                  "text-gray-700 dark:text-gray-300 " +
                  "bg-white dark:bg-gray-800 " +
                  "hover:bg-gray-50 dark:hover:bg-gray-700/50 " +
                  "focus:ring-primary-500 dark:focus:ring-primary-400",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 
                               border-white dark:border-gray-200 mr-2" />
            )}
            {children}
        </button>
    );
}