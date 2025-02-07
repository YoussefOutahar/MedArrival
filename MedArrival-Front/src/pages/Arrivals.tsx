import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { arrivalService } from '@/services/arrival.service';
import { reportService } from '@/services/report.service';
import { ArrivalDTO } from '@/models/ArrivalDTO';
import { PageResponse } from '@/models/PageResponse';
import ArrivalHeader from '@/components/Arrivals/ArrivalHeader';
import ArrivalFilters from '@/components/Arrivals/ArrivalFilters';
import ArrivalTable from '@/components/Arrivals/ArrivalTable';
import ArrivalPagination from '@/components/Arrivals/ArrivalPagination';
import EmptyState from '@/components/Arrivals/EmptyState';
import { ExportDateDialog } from '@/components/Arrivals/ExportDateDialog';

const Arrivals: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [arrivals, setArrivals] = useState<PageResponse<ArrivalDTO>>();
    const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set());
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        fetchArrivals();
    }, [page]);

    const fetchArrivals = async () => {
        try {
            setLoading(true);
            const response = await arrivalService.getAll(page, 10);
            setArrivals(response);
        } catch (error) {
            toast.error('Failed to fetch arrivals');
        } finally {
            setLoading(false);
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
            toast.success('Download successful');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const handleExport = async (startDate: string, endDate: string) => {
        try {
            setIsExporting(true);
            const blob = await reportService.exportAll(startDate, endDate);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arrivals-export-${startDate}-to-${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Export successful');
            setIsExportDialogOpen(false);
        } catch (error) {
            toast.error('Failed to export data');
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ArrivalHeader onExport={() => setIsExportDialogOpen(true)} />

            <ArrivalFilters
                searchTerm={searchTerm}
                dateRange={dateRange}
                onSearchChange={setSearchTerm}
                onDateRangeChange={setDateRange}
                onSearch={fetchArrivals}
                onDateFilter={fetchArrivals}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <ArrivalTable
                    loading={loading}
                    arrivals={arrivals?.content}
                    expandedBatches={expandedBatches}
                    onToggleBatch={(id) => {
                        setExpandedBatches(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(id)) {
                                newSet.delete(id);
                            } else {
                                newSet.add(id);
                            }
                            return newSet;
                        });
                    }}
                    onDownloadExcel={handleDownloadExcel}
                />

                {arrivals && arrivals.totalPages > 1 && (
                    <ArrivalPagination
                        pagination={arrivals}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}

                {arrivals?.content.length === 0 && !loading && <EmptyState />}
            </div>

            <ExportDateDialog
                isOpen={isExportDialogOpen}
                onClose={() => setIsExportDialogOpen(false)}
                onExport={handleExport}
                isExporting={isExporting}
            />
        </div>
    );
};

export default Arrivals;