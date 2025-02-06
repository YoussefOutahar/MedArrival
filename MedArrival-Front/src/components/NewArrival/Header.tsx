import React from 'react';
import { ArrowLeft, Package } from 'lucide-react';

interface HeaderProps {
    title: string;
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
    return (
        <div className="flex items-center gap-3 mb-6">
            <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                    {title}
                </h1>
            </div>
        </div>
    );
};

export default Header;