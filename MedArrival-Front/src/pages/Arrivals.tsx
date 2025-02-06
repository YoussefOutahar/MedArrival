import React, { useState, useEffect } from 'react';
import {
    Plus,
    Download,
    ChevronDown,
    Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { arrivalService } from '@/services/arrival.service';
import { reportService } from '@/services/report.service';
import { ArrivalDTO } from '@/models/ArrivalDTO';
import { PageResponse } from '@/models/PageResponse';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Arrivals() {
    const { t } = useTranslation('arrivals');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [arrivals, setArrivals] = useState<PageResponse<ArrivalDTO>>();
    const [expandedBatch, setExpandedBatch] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const toggleBatch = (batchId: number) => {
        setExpandedBatch(expandedBatch === batchId ? null : batchId);
    };

    const fetchArrivals = async () => {
        try {
            setLoading(true);
            const response = await arrivalService.getAll(page, 10);
            setArrivals(response);
        } catch (error) {
            toast.error(t('toast.fetchError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArrivals();
    }, [page]);

    const handleSearch = () => {
        fetchArrivals();
    };

    const handleDateFilter = async () => {
        if (dateRange.start && dateRange.end) {
            try {
                setLoading(true);
                const response = await arrivalService.findByDateRange(
                    new Date(dateRange.start),
                    new Date(dateRange.end)
                );
                setArrivals({
                    content: response,
                    totalPages: 1,
                    totalElements: response.length,
                    size: response.length,
                    number: 0,
                    first: true,
                    last: true,
                    empty: response.length === 0
                });
            } catch (error) {
                toast.error(t('toast.filterError'));
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownloadExcel = async (invoiceNumber: string) => {
        try {
            const blob = await reportService.downloadInvoiceExcel(invoiceNumber);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceNumber}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(t('toast.downloadSuccess'));
        } catch (error) {
            console.error('Error downloading report:', error);
            toast.error(t('toast.downloadError'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-8 pt-6">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('header.title')}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/arrivals/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 
                                 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg 
                                 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                                 dark:focus:ring-offset-gray-900"
                    >
                        <Plus className="h-4 w-4" />
                        {t('header.newButton')}
                    </button>
                    <button
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

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder={t('filters.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                                 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white 
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                                 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    />
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                                 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                                 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        {t('filters.searchButton')}
                    </button>
                    <button
                        onClick={handleDateFilter}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                                 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        {t('filters.filterDateButton')}
                    </button>
                </div>
            </div>

            {/* Arrivals Table */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="w-8 px-6 py-3"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                           uppercase tracking-wider">
                                    {t('table.columns.invoiceNumber')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                           uppercase tracking-wider">
                                    {t('table.columns.supplier')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                           uppercase tracking-wider">
                                    {t('table.columns.totalSales')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                           uppercase tracking-wider">
                                    {t('table.columns.arrivalDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                           uppercase tracking-wider">
                                    {t('table.columns.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                                                          border-primary-600 dark:border-primary-400" />
                                        </div>
                                    </td>
                                </tr>
                            ) : arrivals?.content.map((arrival) => (
                                <React.Fragment key={arrival.id}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleBatch(arrival.id)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                            >
                                                <ChevronDown
                                                    className={`h-4 w-4 text-gray-500 dark:text-gray-400 transform transition-transform 
                                                              ${expandedBatch === arrival.id ? 'rotate-180' : ''}`}
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
                                                onClick={() => handleDownloadExcel(arrival.invoiceNumber)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 
                                                         dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 
                                                         dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 
                                                         dark:hover:bg-gray-700/50 transition-colors focus:outline-none 
                                                         focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                                                         dark:focus:ring-offset-gray-900"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                {t('table.downloadExcel')}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedBatch === arrival.id && (
                                        <tr>
                                            <td colSpan={6} className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                                                <div className="space-y-4">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t('table.expandedDetails.title')}
                                                    </h4>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 
                                                                           dark:text-gray-400 uppercase">
                                                                    {t('table.expandedDetails.columns.product')}
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 
                                                                           dark:text-gray-400 uppercase">
                                                                    {t('table.expandedDetails.columns.client')}
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 
                                                                           dark:text-gray-400 uppercase">
                                                                    {t('table.expandedDetails.columns.quantity')}
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 
                                                                           dark:text-gray-400 uppercase">
                                                                    {t('table.expandedDetails.columns.totalAmount')}
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 
                                                                           dark:text-gray-400 uppercase">
                                                                    {t('table.expandedDetails.columns.saleDate')}
                                                                </th>
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
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {arrivals && arrivals.totalPages > 1 && (
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between 
                                     border-t border-gray-200 dark:border-gray-700 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={arrivals.first}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 
                                             dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 
                                             dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 
                                             dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('pagination.previous')}
                                </button>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={arrivals.last}
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
                                        <span className="font-medium">{arrivals.number * arrivals.size + 1}</span>{' '}
                                        {t('pagination.to')}{' '}
                                        <span className="font-medium">
                                            {Math.min((arrivals.number + 1) * arrivals.size, arrivals.totalElements)}
                                        </span>{' '}
                                        {t('pagination.of')}{' '}
                                        <span className="font-medium">{arrivals.totalElements}</span>{' '}
                                        {t('pagination.results')}
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={arrivals.first}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border 
                                                     border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                                                     text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 
                                                     dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('pagination.previous')}
                                        </button>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={arrivals.last}
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
                    )}
                </div>
                {arrivals?.content.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 
                                 border-dashed border-gray-300 dark:border-gray-600 mt-4">
                        <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            {t('emptyState.title')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('emptyState.description')}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/arrivals/new')}
                                className="inline-flex items-center px-4 py-2 border border-transparent 
                                         shadow-sm text-sm font-medium rounded-md text-white 
                                         bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                                         dark:hover:bg-primary-600 focus:outline-none focus:ring-2 
                                         focus:ring-offset-2 focus:ring-primary-500
                                         dark:focus:ring-offset-gray-900"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                {t('header.newButton')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Arrivals;