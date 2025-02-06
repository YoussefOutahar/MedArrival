import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer, Mail, TrendingUp, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reportService } from '@/services/report.service';
import { useTranslation } from 'react-i18next';

interface ReportFilter {
  startDate: string;
  endDate: string;
  supplier?: string;
  productCategory?: string;
  status?: string;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

function Reports() {
  const { t } = useTranslation('reports');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

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
  ];

  const suppliers = [
    'MedSupply Co',
    'SafeCare Ltd',
    'MedEquip Inc',
  ];

  const productCategories = [
    'PPE',
    'Surgical Instruments',
    'Disposables',
    'Medical Devices',
  ];

  const statuses = [
    'Active',
    'Inactive',
    'Pending',
  ];

  const handleGenerateReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error(t('toast.selectDates'));
      return;
    }

    setIsGenerating(true);
    try {
      let blob: Blob;

      const formattedStartDate = `${filters.startDate}T00:00:00`;
      const formattedEndDate = `${filters.endDate}T23:59:59`;

      switch (selectedReport) {
        case 'product-summary':
          blob = await reportService.downloadProductSummaryReport(
            formattedStartDate,
            formattedEndDate
          );
          break;
        case 'monthly-statement':
          blob = await reportService.downloadMonthlyProductReport(
            formattedStartDate,
            formattedEndDate
          );
          break;
        case 'sales-forecast':
          blob = await reportService.downloadClientSalesForecast(
            formattedStartDate,
            formattedEndDate
          );
          break;
        case 'purchase-invoice':
          if (!filters.supplier) {
            toast.error(t('toast.selectSupplier'));
            return;
          }
          blob = await reportService.downloadInvoiceExcel(filters.supplier);
          break;
        default:
          toast.error(t('toast.notImplemented'));
          setIsGenerating(false);
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on report type
      let filename = '';
      switch (selectedReport) {
        case 'monthly-statement':
          filename = `monthly-product-report-${filters.startDate.substring(0, 7)}.xlsx`;
          break;
        case 'sales-forecast':
          filename = `client-sales-forecast-${filters.startDate.substring(0, 7)}.xlsx`;
          break;
        case 'product-summary':
          filename = `product-summary-${filters.startDate}-${filters.endDate}.xlsx`;
          break;
        default:
          filename = `${selectedReport}-${new Date().toISOString().split('T')[0]}.xlsx`;
      }

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

  const handleExport = async () => {
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
    toast.error(t('toast.emailError'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-8 pt-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('header.title')}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
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

        {selectedReport && (
          <>
            {/* Filters Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('filters.title')}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('filters.startDate')}
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                               dark:focus:ring-primary-400 dark:focus:border-primary-400 
                               text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('filters.endDate')}
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                               dark:focus:ring-primary-400 dark:focus:border-primary-400 
                               text-gray-900 dark:text-white"
                    />
                  </div>
                  {selectedReport === 'arrivals' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('filters.supplier.label')}
                      </label>
                      <select
                        value={filters.supplier}
                        onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                 dark:focus:ring-primary-400 dark:focus:border-primary-400 
                                 text-gray-900 dark:text-white"
                      >
                        <option value="">{t('filters.supplier.placeholder')}</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier} value={supplier} className="dark:bg-gray-700">
                            {supplier}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedReport === 'inventory' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('filters.productCategory.label')}
                        </label>
                        <select
                          value={filters.productCategory}
                          onChange={(e) => setFilters({ ...filters, productCategory: e.target.value })}
                          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                                   text-gray-900 dark:text-white"
                        >
                          <option value="">{t('filters.productCategory.placeholder')}</option>
                          {productCategories.map((category) => (
                            <option key={category} value={category} className="dark:bg-gray-700">
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('filters.status.label')}
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                                   text-gray-900 dark:text-white"
                        >
                          <option value="">{t('filters.status.placeholder')}</option>
                          {statuses.map((status) => (
                            <option key={status} value={status} className="dark:bg-gray-700">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('preview.title')}
                </h2>
              </div>
              <div className="p-6">
                <div className="h-96 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed 
                              border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      {t('preview.heading')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('preview.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleEmailReport}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 
                         dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                         focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                         dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="h-5 w-5" />
                {t('actions.emailReport')}
              </button>
              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 
                         dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                         focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                         dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-5 w-5" />
                {t('actions.printReport')}
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedReport || !filters.startDate || !filters.endDate}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 
                         hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 
                         text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 
                         focus:ring-primary-500 dark:focus:ring-offset-gray-900
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                {isGenerating ? t('actions.generating') : t('actions.downloadReport')}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;