import { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { reportService } from '@/services/report.service';
import { ReportFilter } from '@/types/reports';

import ReportTypes from '@/components/Reports/ReportTypes';
import ReportFilters from '@/components/Reports/ReportFilters';
import ActionButtons from '@/components/Reports/ActionButtons';

function Reports() {
  const { t } = useTranslation('reports');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
    supplier: undefined,
    arrival: undefined,
    client: undefined,
    searchTerm: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const validateFilters = (): boolean => {
    if (selectedReport === 'purchase-invoice') {
      if (!filters.supplier) {
        toast.error(t('toast.selectSupplier'));
        return false;
      }
      if (!filters.arrival) {
        toast.error(t('toast.selectArrival'));
        return false;
      }
      return true;
    } else {
      if (!filters.startDate || !filters.endDate) {
        toast.error(t('toast.selectDates'));
        return false;
      }

      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      if (end < start) {
        toast.error(t('toast.invalidDateRange'));
        return false;
      }
      return true;
    }
  };

  const handleGenerateReport = async () => {
    if (!validateFilters()) {
      return;
    }

    setIsGenerating(true);
    try {
      let blob: Blob;
      let filename: string;

      const formattedStartDate = filters.startDate ? `${filters.startDate}T00:00:00` : '';
      const formattedEndDate = filters.endDate ? `${filters.endDate}T23:59:59` : '';

      switch (selectedReport) {
        case 'purchase-invoice':
          blob = await reportService.downloadInvoiceExcel(filters.arrival!);
          filename = `invoice-${filters.arrival}-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        case 'product-summary':
          blob = await reportService.downloadProductSummaryReport(
            formattedStartDate,
            formattedEndDate
          );
          filename = `product-summary-${filters.startDate}-${filters.endDate}.xlsx`;
          break;

        case 'monthly-statement':
          blob = await reportService.downloadMonthlyProductReport(
            formattedStartDate,
            formattedEndDate
          );
          filename = `monthly-product-report-${filters.startDate.substring(0, 7)}.xlsx`;
          break;

        case 'sales-forecast':
          blob = await reportService.downloadClientSalesForecast(
            formattedStartDate,
            formattedEndDate
          );
          filename = `client-sales-forecast-${filters.startDate.substring(0, 7)}.xlsx`;
          break;

        case 'client-receipt':
          if (!filters.client) {
            toast.error(t('toast.selectClient'));
            return;
          }
          blob = await reportService.downloadClientReceiptReport(
            filters.client,
            formattedStartDate,
            formattedEndDate
          );
          filename = `client-receipt-${filters.client}-${filters.startDate}-${filters.endDate}.xlsx`;
          break;

        case 'all-receipts':
          blob = await reportService.downloadAllReceiptsReport(
            formattedStartDate,
            formattedEndDate
          );
          filename = `all-receipts-${filters.startDate}-${filters.endDate}.xlsx`;
          break;

        case 'download-all':
          blob = await reportService.exportAll(
            filters.startDate,
            filters.endDate
          );
          filename = `all-reports-${filters.startDate}-${filters.endDate}.xlsx`;
          break;

        default:
          toast.error(t('toast.invalidReportType'));
          setIsGenerating(false);
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('toast.success'));
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t('toast.error'));
    } finally {
      setIsGenerating(false);
    }
  };
  const handleReportTypeChange = (reportType: string) => {
    setSelectedReport(reportType);
    setFilters({
      startDate: '',
      endDate: '',
      supplier: undefined,
      arrival: undefined,
      searchTerm: '',
    });
  };

  const handleFiltersChange = (newFilters: ReportFilter) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    if (!validateFilters()) {
      return;
    }

    setIsGenerating(true);
    try {
      window.print();
      toast.success(t('toast.printSuccess'));
    } catch (error) {
      console.error('Error printing report:', error);
      toast.error(t('toast.printError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    if (!validateFilters()) {
      return;
    }
    toast.error(t('toast.emailNotImplemented'));
  };

  // Calculate if filters are valid without showing toasts
  const areFiltersValid = (): boolean => {
    if (selectedReport === 'purchase-invoice') {
      return !!(filters.supplier && filters.arrival);
    } else {
      if (!filters.startDate || !filters.endDate) return false;
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      return end >= start;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6 px-8 pt-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('header.title')}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ReportTypes
          selectedReport={selectedReport}
          onSelectReport={handleReportTypeChange}
        />

        {selectedReport && (
          <>
            <ReportFilters
              selectedReport={selectedReport}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            <ActionButtons
              isGenerating={isGenerating}
              selectedReport={selectedReport}
              hasValidFilters={areFiltersValid()}
              onEmailReport={handleEmailReport}
              onPrintReport={handleExport}
              onGenerateReport={handleGenerateReport}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;