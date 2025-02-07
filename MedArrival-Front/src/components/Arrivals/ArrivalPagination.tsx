import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageResponse } from '@/models/PageResponse';

interface ArrivalPaginationProps {
  pagination: PageResponse<any>;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ArrivalPagination: React.FC<ArrivalPaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
}) => {
  const { t } = useTranslation('arrivals');

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between 
                   border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={pagination.first}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 
                   dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 
                   dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 
                   dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('pagination.previous')}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={pagination.last}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 
                   dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 
                   dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 
                   dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('pagination.next')}
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('pagination.showing')}{' '}
            <span className="font-medium">{pagination.number * pagination.size + 1}</span>{' '}
            {t('pagination.to')}{' '}
            <span className="font-medium">
              {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)}
            </span>{' '}
            {t('pagination.of')}{' '}
            <span className="font-medium">{pagination.totalElements}</span>{' '}
            {t('pagination.results')}
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={pagination.first}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border 
                       border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                       text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 
                       dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('pagination.previous')}
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={pagination.last}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border 
                       border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                       text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 
                       dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('pagination.next')}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ArrivalPagination;