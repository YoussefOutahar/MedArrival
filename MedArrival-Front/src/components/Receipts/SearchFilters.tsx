import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const { t } = useTranslation('receipts');

  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 
                   border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
    </div>
  );
};

export default SearchFilters;