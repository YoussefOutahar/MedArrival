import { useTranslation } from 'react-i18next';

interface DateRange {
  start: string;
  end: string;
}

interface ArrivalFiltersProps {
  searchTerm: string;
  dateRange: DateRange;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onSearch: () => void;
  onDateFilter: () => void;
}

const ArrivalFilters: React.FC<ArrivalFiltersProps> = ({
  searchTerm,
  dateRange,
  onSearchChange,
  onDateRangeChange,
  onSearch,
  onDateFilter,
}) => {
  const { t } = useTranslation('arrivals');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                    dark:border-gray-600 rounded-lg text-gray-900 dark:text-white 
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                    dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                    dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                    dark:hover:bg-gray-700/50 transition-colors"
        >
          {t('filters.searchButton')}
        </button>
        <button
          onClick={onDateFilter}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                    dark:hover:bg-gray-700/50 transition-colors"
        >
          {t('filters.filterDateButton')}
        </button>
      </div>
    </div>
  );
};

export default ArrivalFilters;