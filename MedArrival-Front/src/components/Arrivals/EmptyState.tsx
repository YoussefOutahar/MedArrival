import React from 'react';
import { Plus, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EmptyState: React.FC = () => {
  const { t } = useTranslation('arrivals');
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 
                   border-dashed border-gray-300 dark:border-gray-600 mt-4">
      <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {t('emptyState.title')}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {t('emptyState.description')}
      </p>
      <div className="mt-6">
        <button
          onClick={() => navigate('/arrivals/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent 
                   shadow-sm text-sm font-medium rounded-md text-white 
                   bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                   dark:hover:bg-primary-600 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-primary-500
                   dark:focus:ring-offset-gray-900"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('header.newButton')}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;