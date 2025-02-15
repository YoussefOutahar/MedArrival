import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrivalDTO } from '@/models/ArrivalDTO';

interface ExpandedDetailsProps {
  arrival: ArrivalDTO;
}

const ExpandedDetails: React.FC<ExpandedDetailsProps> = ({ arrival }) => {
  const { t } = useTranslation('arrivals');

  return (
    <tr>
      <td colSpan={6} className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
        <div className="space-y-6">
          {arrival.sales.map((sale) => (
            <div 
              key={`${sale.id}-${sale.product.id}-${sale.client.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {sale.product.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {sale.client.name}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${sale.client.clientType === 'CLIENT_RP' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                      {t(`clientType.${sale.client.clientType}`)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('table.expandedDetails.quantity')}: 
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {sale.quantity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('table.expandedDetails.totalAmount')}: 
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      ${sale.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sale.priceComponents.map((pc) => (
                  <div 
                    key={pc.componentType}
                    className="flex items-center justify-between p-3 rounded-lg border
                             border-gray-200 dark:border-gray-700"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(`priceComponents.${pc.componentType}`)}
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                        ${pc.usesDefaultPrice 
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {pc.usesDefaultPrice ? t('priceComponents.default') : t('priceComponents.custom')}
                      </span>
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      ${pc.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                {t('table.expandedDetails.saleDate')}: {new Date(sale.saleDate).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
};

export default ExpandedDetails;