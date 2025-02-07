import React from 'react';
import { FileText, Calendar, Package, TrendingUp, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/types/reports';

interface ReportTypesProps {
    selectedReport: string;
    onSelectReport: (id: string) => void;
}

const ReportTypes: React.FC<ReportTypesProps> = ({ selectedReport, onSelectReport }) => {
    const { t } = useTranslation('reports');

    const reportTypes: ReportType[] = [
        {
            id: 'purchase-invoice',
            name: t('reportTypes.purchaseInvoice.name'),
            description: t('reportTypes.purchaseInvoice.description'),
            icon: <FileText className="h-8 w-8 text-blue-600" />,
        },
        {
            id: 'monthly-statement',
            name: t('reportTypes.monthlyStatement.name'),
            description: t('reportTypes.monthlyStatement.description'),
            icon: <Calendar className="h-8 w-8 text-purple-600" />,
        },
        {
            id: 'product-summary',
            name: t('reportTypes.productSummary.name'),
            description: t('reportTypes.productSummary.description'),
            icon: <Package className="h-8 w-8 text-green-600" />,
        },
        {
            id: 'sales-forecast',
            name: t('reportTypes.salesForecast.name'),
            description: t('reportTypes.salesForecast.description'),
            icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
        },
        {
            id: 'download-all',
            name: t('reportTypes.downloadAll.name'),
            description: t('reportTypes.downloadAll.description'),
            icon: <Download className="h-8 w-8 text-indigo-600" />,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {reportTypes.map((report) => (
                <button
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className={`p-6 text-left rounded-lg border-2 transition-all 
                     ${selectedReport === report.id
                            ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 dark:hover:border-primary-700'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            {report.icon}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{report.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ReportTypes;