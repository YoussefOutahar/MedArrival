// pages/ClientReceipts.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, FileText, Plus, Printer, Download, Mail } from 'lucide-react';
import { ClientDTO } from '@/models/ClientDTO';
import { ReceiptDTO } from '@/models/ReceiptDTO';
import { clientService } from '@/services/client.service';

const ClientReceipts: React.FC = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientDTO | null>(null);
  const [receipts, setReceipts] = useState<ReceiptDTO[]>([]);
  const [dateRange, setDateRange] = useState({
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
      toast.error('Failed to fetch client data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptAction = async (action: string, receiptId: number) => {
    try {
      switch (action) {
        case 'print':
        case 'download':
        case 'email':
          toast.success(`Receipt ${action}ed successfully`);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      toast.error(`Failed to ${action} receipt`);
      console.error(error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/receipts')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                {client?.name} - Receipts
              </h1>
            </div>
            <button
              onClick={() => navigate(`/receipts/${clientId}/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
                       hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded-lg"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded-lg"
          />
          <button
            onClick={fetchClientAndReceipts}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Filter
          </button>
        </div>

        {/* Receipts Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Receipt Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {receipt.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(receipt.receiptDate.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatAmount(receipt.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                   bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                      {receipt.deliveryReceived ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReceiptAction('print', receipt.id)}
                        className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReceiptAction('download', receipt.id)}
                        className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReceiptAction('email', receipt.id)}
                        className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <Mail className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {receipts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">No receipts found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new receipt to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientReceipts;