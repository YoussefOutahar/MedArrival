// ClientReceipts.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, FileText, Plus, Printer, Download, Mail, Calendar, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientDTO } from '@/models/ClientDTO';
import { ReceiptDTO } from '@/models/ReceiptDTO';
import { clientService } from '@/services/client.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DateRange {
    start: string;
    end: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(amount);
};

const ClientReceipts: React.FC = () => {
    const { t } = useTranslation('receipts');
    const { clientId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<ClientDTO | null>(null);
    const [receipts, setReceipts] = useState<ReceiptDTO[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>({
        start: '',
        end: ''
    });

    useEffect(() => {
        if (clientId) {
            fetchClientAndReceipts();
        }
    }, [clientId]);

    const fetchClientAndReceipts = async () => {
        try {
            setLoading(true);
            const [clientData, receiptsData] = await Promise.all([
                clientService.getById(Number(clientId)),
                clientService.getClientReceipts(
                    Number(clientId),
                    dateRange.start ? new Date(dateRange.start) : undefined,
                    dateRange.end ? new Date(dateRange.end) : undefined
                )
            ]);
            setClient(clientData);
            setReceipts(receiptsData);
        } catch (error) {
            toast.error(t('clientReceipts.errors.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptAction = async (action: 'print' | 'download' | 'email', receiptId: number) => {
        try {
            switch (action) {
                case 'print':
                    // await clientService.printReceipt(Number(clientId), receiptId);
                    toast.success(t('clientReceipts.success.printed'));
                    break;
                case 'download':
                    // await clientService.downloadReceipt(Number(clientId), receiptId);
                    toast.success(t('clientReceipts.success.downloaded'));
                    break;
                case 'email':
                    // await clientService.emailReceipt(Number(clientId), receiptId);-
                    toast.success(t('clientReceipts.success.emailed'));
                    break;
            }
        } catch (error) {
            toast.error(t(`clientReceipts.errors.${action}Failed`));
        }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                      <div className="flex items-center gap-2">
                          <button
                              onClick={() => navigate('/admin/receipts')}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                                       transition-colors"
                          >
                              <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {t('clientReceipts.header.title', { clientName: client?.name })}
                              </h1>
                          </div>
                      </div>
                      {/* <Button
                          onClick={() => navigate(`/receipts/${clientId}/new`)}
                          className="flex items-center gap-2"
                      >
                          <Plus className="h-4 w-4" />
                          {t('clientReceipts.buttons.newReceipt')}
                      </Button> */}
                  </div>
              </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Filters Card */}
              <Card className="mb-6">
                  <CardHeader>
                      <div className="flex items-center gap-2">
                          <Filter className="h-5 w-5 text-gray-400" />
                          <CardTitle className="text-gray-900 dark:text-white">{t('clientReceipts.filters.title')}</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <div className="flex gap-4">
                          <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('clientReceipts.filters.startDate')}
                              </label>
                              <Input
                                  type="date"
                                  value={dateRange.start}
                                  onChange={(e) => setDateRange(prev => ({ 
                                      ...prev, 
                                      start: e.target.value 
                                  }))}
                              />
                          </div>
                          <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('clientReceipts.filters.endDate')}
                              </label>
                              <Input
                                  type="date"
                                  value={dateRange.end}
                                  onChange={(e) => setDateRange(prev => ({ 
                                      ...prev, 
                                      end: e.target.value 
                                  }))}
                              />
                          </div>
                          <div className="flex items-end">
                              <Button 
                                  variant="outline"
                                  onClick={fetchClientAndReceipts}
                                  className="flex items-center gap-2 text-gray-900 dark:text-white"
                              >
                                  <Filter className="h-4 w-4" />
                                  {t('clientReceipts.buttons.filter')}
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Receipts Table Card */}
              <Card>
                  <CardHeader>
                      <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <CardTitle className="text-gray-900 dark:text-white">{t('clientReceipts.table.title')}</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent>
                      {loading ? (
                          <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                                            border-primary-600 dark:border-primary-400" />
                          </div>
                      ) : receipts.length === 0 ? (
                          <div className="text-center py-12">
                              <FileText className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {t('clientReceipts.emptyState.title')}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {t('clientReceipts.emptyState.description')}
                              </p>
                              <Button
                                  onClick={() => navigate(`/receipts/${clientId}/new`)}
                                  className="mt-4"
                              >
                                  {t('clientReceipts.buttons.newReceipt')}
                              </Button>
                          </div>
                      ) : (
                          <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                          {[
                                              'receiptNumber',
                                              'date',
                                              'amount',
                                              'status',
                                              'actions'
                                          ].map((header) => (
                                              <th
                                                  key={header}
                                                  className="px-6 py-3 text-left text-xs font-medium 
                                                           text-gray-500 dark:text-gray-400 uppercase 
                                                           tracking-wider"
                                              >
                                                  {t(`clientReceipts.table.headers.${header}`)}
                                              </th>
                                          ))}
                                      </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-800 divide-y 
                                                   divide-gray-200 dark:divide-gray-700">
                                      {receipts.map((receipt) => (
                                          <tr key={receipt.id}>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm 
                                                           font-medium text-gray-900 dark:text-white">
                                                  {receipt.receiptNumber}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm 
                                                           text-gray-500 dark:text-gray-400">
                                                  {new Date(receipt.receiptDate).toLocaleDateString()}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm 
                                                           text-gray-500 dark:text-gray-400">
                                                  {formatCurrency(receipt.totalAmount)}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className={`px-2 inline-flex text-xs leading-5 
                                                                  font-semibold rounded-full
                                                                  ${receipt.deliveryReceived
                                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                                  }`}>
                                                      {receipt.deliveryReceived
                                                          ? t('clientReceipts.status.delivered')
                                                          : t('clientReceipts.status.pending')}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                  <div className="flex items-center gap-2">
                                                      <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-gray-900 dark:text-white"
                                                          onClick={() => handleReceiptAction('print', receipt.id)}
                                                          title={t('clientReceipts.actions.print')}
                                                      >
                                                          <Printer className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-gray-900 dark:text-white"
                                                          onClick={() => handleReceiptAction('download', receipt.id)}
                                                          title={t('clientReceipts.actions.download')}
                                                      >
                                                          <Download className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-gray-900 dark:text-white"
                                                          onClick={() => handleReceiptAction('email', receipt.id)}
                                                          title={t('clientReceipts.actions.email')}
                                                      >
                                                          <Mail className="h-4 w-4" />
                                                      </Button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>
  );
};

export default ClientReceipts;