import React from 'react';
import { Mail, Printer, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
    isGenerating: boolean;
    selectedReport: string;
    hasValidFilters: boolean;
    onEmailReport: () => Promise<void>;
    onPrintReport: () => Promise<void>;
    onGenerateReport: () => Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    isGenerating,
    selectedReport,
    hasValidFilters,
    onEmailReport,
    onPrintReport,
    onGenerateReport,
}) => {
    const { t } = useTranslation('reports');

    return (
        <div className="mt-6 flex justify-end gap-4">
            <button
                onClick={onEmailReport}
                disabled={isGenerating || !hasValidFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 
                 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Mail className="h-5 w-5" />
                {t('actions.emailReport')}
            </button>
            <button
                onClick={onPrintReport}
                disabled={isGenerating || !hasValidFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 
                 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Printer className="h-5 w-5" />
                {t('actions.printReport')}
            </button>
            <button
                onClick={onGenerateReport}
                disabled={isGenerating || !selectedReport || !hasValidFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 
                 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 
                 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 
                 focus:ring-primary-500 dark:focus:ring-offset-gray-900
                 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="h-5 w-5" />
                {isGenerating ? t('actions.generating') : t('actions.downloadReport')}
            </button>
        </div>
    );
};

export default ActionButtons;