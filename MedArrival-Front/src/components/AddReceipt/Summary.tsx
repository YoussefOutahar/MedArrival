// Summary.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SummaryProps {
    totalHT: number;
    totalTTC: number;
}

export const Summary: React.FC<SummaryProps> = ({ totalHT, totalTTC }) => {
    const { t } = useTranslation('receipts');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-gray-900 dark:text-white">{t('receipts.addReceipt.summary.title')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {t('receipts.addReceipt.summary.totalHT')}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            MAD {totalHT.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {t('receipts.addReceipt.summary.totalTTC')}
                        </span>
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            MAD {totalTTC.toFixed(2)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Summary;