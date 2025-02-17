// Receipts.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientDTO } from '@/models/ClientDTO';
import { clientService } from '@/services/client.service';
import { PageResponse } from '@/models/PageResponse';

import ClientRow from '@/components/Receipts/ClientRow';
import { ACTIONS } from '@/components/Receipts/Actions';

const Receipts: React.FC = () => {
  const { t } = useTranslation('receipts');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<PageResponse<ClientDTO>>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll(0, 50, {
        search: searchTerm
      });
      setClients(response);
    } catch (error) {
      toast.error(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: string, clientId: number) => {
    try {
      switch (type) {
        case ACTIONS.NEW_RECEIPT:
          navigate(`/admin/receipts/${clientId}/new`);
          break;
        case ACTIONS.VIEW_RECEIPTS:
          navigate(`/admin/receipts/${clientId}`);
          break;
        case ACTIONS.VIEW_ATTACHMENTS:
          const receipts = await clientService.getClientReceipts(clientId);
          if (receipts.length > 0) {
            const latestReceipt = receipts[0];
            navigate(`/admin/receipts/${clientId}/${latestReceipt.id}/attachments`);
          } else {
            toast.error(t('errors.noReceipts'));
          }
          break;
        default:
          console.warn('Unknown action:', type);
      }
    } catch (error) {
      toast.error(t('errors.actionFailed', { action: type.toLowerCase() }));
      console.error(`Error performing ${type}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/20 
                          flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('header.title')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
            </div>
          ) : clients?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('emptyState.title')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('emptyState.description')}
              </p>
            </div>
          ) : (
            clients?.content.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Receipts;