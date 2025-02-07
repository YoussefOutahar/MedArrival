import React from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArrivalDTO } from '@/models/ArrivalDTO';
import ExpandedDetails from './ExpandedDetails';

interface ArrivalRowProps {
  arrival: ArrivalDTO;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onDownloadExcel: (invoiceNumber: string) => void;
}

const ArrivalRow: React.FC<ArrivalRowProps> = ({
  arrival,
  isExpanded,
  onToggle,
  onDownloadExcel,
}) => {
  const { t } = useTranslation('arrivals');

  return (
    <React.Fragment>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="px-6 py-4">
          <button
            onClick={() => onToggle(arrival.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 text-gray-500 dark:text-gray-400 transform transition-transform 
                       ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </td>
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
          {arrival.invoiceNumber}
        </td>
        <td className="px-6 py-4 text-gray-900 dark:text-white">
          {arrival.supplier.name}
        </td>
        <td className="px-6 py-4 text-gray-900 dark:text-white">
          {arrival.sales.length} {t('table.salesCount')}
        </td>
        <td className="px-6 py-4 text-gray-900 dark:text-white">
          {new Date(arrival.arrivalDate).toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <button
            onClick={() => onDownloadExcel(arrival.invoiceNumber)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 
                     dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 
                     dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 
                     dark:hover:bg-gray-700/50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('table.downloadExcel')}
          </button>
        </td>
      </tr>
      {isExpanded && <ExpandedDetails arrival={arrival} />}
    </React.Fragment>
  );
};

export default ArrivalRow;