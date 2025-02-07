import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReportPreviewProps {
    data: any | null;
    onPreview: () => void;
    isLoading: boolean;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ data, onPreview, isLoading }) => {
    const { t } = useTranslation('reports');

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('preview.title')}
                    </h2>
                </div>
                <div className="p-6">
                    <div className="h-96 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('preview.title')}
                    </h2>
                </div>
                <div className="p-6">
                    <div className="h-96 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed 
                border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {t('preview.heading')}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {t('preview.description')}
                            </p>
                            <button
                                onClick={onPreview}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                       text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500"
                            >
                                {t('preview.generatePreview')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('preview.title')}
                </h2>
            </div>
            <div className="p-6">
                <div className="h-96 overflow-auto">
                    <pre className="text-sm text-gray-700 dark:text-gray-300">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;