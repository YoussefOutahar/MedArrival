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
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {t('table.expandedDetails.title')}
          </h4>
          <table className="w-full">
            <thead>
              <tr>
                {/* Column headers */}
              </tr>
            </thead>
            <tbody>
              {arrival.sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {sale.product.name}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {sale.client.name}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {sale.quantity}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    ${sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {new Date(sale.saleDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

export default ExpandedDetails;