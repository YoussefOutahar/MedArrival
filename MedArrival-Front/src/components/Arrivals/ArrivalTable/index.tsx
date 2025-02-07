import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrivalDTO } from '@/models/ArrivalDTO';
import ArrivalRow from './ArrivalRow';
import LoadingRow from './LoadingRow';

interface ArrivalTableProps {
    loading: boolean;
    arrivals?: ArrivalDTO[];
    expandedBatches: Set<number>;
    onToggleBatch: (id: number) => void;
    onDownloadExcel: (invoiceNumber: string) => void;
}

const ArrivalTable: React.FC<ArrivalTableProps> = ({
    loading,
    arrivals,
    expandedBatches,
    onToggleBatch,
    onDownloadExcel,
}) => {
    const { t } = useTranslation('arrivals');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="w-8 px-6 py-3"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.columns.invoiceNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.columns.supplier')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.columns.totalSales')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.columns.arrivalDate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.columns.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <LoadingRow />
                    ) : (
                        arrivals?.map((arrival) => (
                            <ArrivalRow
                                key={arrival.id}
                                arrival={arrival}
                                isExpanded={expandedBatches.has(arrival.id)}
                                onToggle={onToggleBatch}
                                onDownloadExcel={onDownloadExcel}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ArrivalTable;