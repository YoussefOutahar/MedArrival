import { Plus, Download, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATHS } from '@/routes/paths';

interface ArrivalHeaderProps {
  onExport: () => void;
}

const ArrivalHeader: React.FC<ArrivalHeaderProps> = ({ onExport }) => {
  const { t } = useTranslation('arrivals');
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6 px-8 pt-6">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('header.title')}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.ADMIN.NEW_ARRIVAL)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 
                    dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg 
                    transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                    dark:focus:ring-offset-gray-900"
        >
          <Plus className="h-4 w-4" />
          {t('header.newButton')}
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 
                    transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    dark:focus:ring-offset-gray-900"
        >
          <Download className="h-4 w-4" />
          {t('header.exportButton')}
        </button>
      </div>
    </div>
  );
};

export default ArrivalHeader;