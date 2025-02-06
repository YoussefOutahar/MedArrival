import React from 'react';
import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
    loading: boolean;
    onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ loading, onCancel }) => {
    const { t } = useTranslation('newArrival');

    return (
        <div className="flex justify-end gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 
                 text-gray-700 dark:text-gray-300 rounded-lg 
                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                {t('actions.cancel')}
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 
                 dark:bg-primary-500 dark:hover:bg-primary-600 
                 text-white rounded-lg transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {t('actions.creating')}
                    </div>
                ) : (
                    t('actions.create')
                )}
            </button>
        </div>
    );
};

export default ActionButtons;