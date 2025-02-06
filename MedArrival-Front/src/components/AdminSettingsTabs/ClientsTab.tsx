// ClientsTab.tsx
import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ClientDTO, ClientType } from '@/models/ClientDTO';
import { clientService } from '@/services/client.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { TableWrapper } from '../TableWrapper';
import { FormDialog } from '../FormDialog';
import { FormButton } from '../FormButton';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { FileUploadButton } from '../FileUploadButton';
import { ClientProductsDialog } from '../ClientProductsDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog.tsx';
import { ClientTypeToggle } from '../ClientTypeToggle.tsx';

function ClientsTab() {
  const { t } = useTranslation('settings');

  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<ClientDTO>>({
    name: '',
    address: '',
    clientType: ClientType.CLIENT_RP,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    clientId: number | null;
    clientName: string;
  }>({
    isOpen: false,
    clientId: null,
    clientName: '',
  });
  const [productsDialog, setProductsDialog] = useState<{
    isOpen: boolean;
    client: ClientDTO | null;
  }>({
    isOpen: false,
    client: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll(0, 100);
      setClients(response.content);
    } catch (error) {
      toast.error(t('common.messages.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const columns = useMemo<ColumnDef<ClientDTO>[]>(() => [
    {
      accessorKey: 'name',
      header: t('clients.table.name'),
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: t('clients.table.address'),
      cell: (info) => (
        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {String(info.getValue())}
        </div>
      ),
    },
    {
      accessorKey: 'clientType',
      header: t('clients.table.type'),
      cell: (info) => (
        <ClientTypeToggle
          clientType={info.getValue() as ClientType}
          onToggle={async () => {
            try {
              await clientService.toggleClientType(info.row.original.id);
              await fetchClients();
            } catch (error) {
              toast.error(t('common.messages.errors.updateFailed'));
            }
          }}
        />
      ),
    },
    {
      id: 'products',
      header: t('clients.table.products'),
      cell: (info) => (
        info.row.original.clientType === ClientType.CLIENT_MARCHER && (
          <button
            onClick={() => setProductsDialog({
              isOpen: true,
              client: info.row.original,
            })}
            className="inline-flex items-center px-3 py-1 border border-gray-300 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 
                     bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-primary-500"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            {t('clients.buttons.manageProducts')}
          </button>
        )
      ),
    },
    {
      id: 'actions',
      header: t('clients.table.actions'),
      cell: (info) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(info.row.original)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 
                     dark:hover:text-primary-300 transition-colors p-1 rounded-full 
                     hover:bg-primary-50 dark:hover:bg-primary-900/30"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(info.row.original)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 
                     dark:hover:text-red-300 transition-colors p-1 rounded-full 
                     hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ], [t, fetchClients]);

  const table = useReactTable({
    data: clients,
    columns,  // Remove the 'as any' cast
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentClient.name || !currentClient.address) {
      toast.error(t('common.messages.errors.required'));
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await clientService.update(currentClient.id!, currentClient);
        toast.success(t('common.messages.success.updated'));
      } else {
        await clientService.create(currentClient);
        toast.success(t('common.messages.success.created'));
      }
      setIsModalOpen(false);
      await fetchClients();
      resetForm();
    } catch (error) {
      toast.error(t(isEditing ? 'common.messages.errors.updateFailed' : 'common.messages.errors.createFailed'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (client: ClientDTO) => {
    setCurrentClient(client);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (client: ClientDTO) => {
    setDeleteDialog({
      isOpen: true,
      clientId: client.id,
      clientName: client.name,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.clientId) return;

    try {
      setIsDeleting(true);
      await clientService.delete(deleteDialog.clientId);
      toast.success(t('common.messages.success.deleted'));
      await fetchClients();
    } catch (error) {
      toast.error(t('common.messages.errors.deleteFailed'));
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, clientId: null, clientName: '' });
    }
  };

  const resetForm = () => {
    setCurrentClient({
      name: '',
      address: '',
      clientType: ClientType.CLIENT_RP,
    });
    setIsEditing(false);
  };

  const handleDownloadTemplate = async (type: 'csv' | 'excel') => {
    try {
      const blob = type === 'csv'
        ? await clientService.downloadCsvTemplate()
        : await clientService.downloadExcelTemplate();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `client-template.${type === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t('common.messages.errors.downloadFailed'));
      console.error(error);
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      setIsImporting(true);
      const importedClients = await clientService.bulkImport(file);
      toast.success(t('common.messages.success.imported', { count: importedClients.length }));
      await fetchClients();
    } catch (error) {
      toast.error(t('common.messages.errors.importFailed'));
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('clients.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            {t('clients.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 
                     rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 transition-colors"
          >
            {t('common.actions.download.csv')}
          </button>
          <button
            onClick={() => handleDownloadTemplate('excel')}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 
                     rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 transition-colors"
          >
            {t('common.actions.download.excel')}
          </button>
          <FileUploadButton
            onFileSelect={handleFileImport}
            accept=".csv,.xlsx,.xls"
            isLoading={isImporting}
          />
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white 
                     bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('clients.buttons.add')}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
              <TableWrapper>
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            {t('common.pagination.previous')}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.pagination.next')}
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('common.pagination.page')} {table.getState().pagination.pageIndex + 1} {t('common.pagination.of')} {table.getPageCount()}
        </span>
      </div>

      {/* Form Dialog */}
      <FormDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing
          ? t('clients.form.title.edit', { name: currentClient.name })
          : t('clients.form.title.add')}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('clients.form.fields.name.label')}
            </Label>
            <Input
              id="name"
              value={currentClient.name}
              onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
              className="h-12 w-full rounded-md"
              placeholder={t('clients.form.fields.name.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('clients.form.fields.address.label')}
            </Label>
            <Textarea
              id="address"
              value={currentClient.address}
              onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
              className="min-h-[120px] w-full rounded-md"
              placeholder={t('clients.form.fields.address.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('clients.form.fields.type.label')}
            </Label>
            <ClientTypeToggle
              clientType={currentClient.clientType || ClientType.CLIENT_RP}
              onToggle={() => setCurrentClient({
                ...currentClient,
                clientType: currentClient.clientType === ClientType.CLIENT_MARCHER
                  ? ClientType.CLIENT_RP
                  : ClientType.CLIENT_MARCHER
              })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.actions.cancel')}
            </FormButton>
            <FormButton
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? t('common.actions.update') : t('common.actions.add')}
            </FormButton>
          </div>
        </form>
      </FormDialog>

      {/* Products Dialog */}
      {productsDialog.client && (
        <ClientProductsDialog
          isOpen={productsDialog.isOpen}
          onClose={() => setProductsDialog({ isOpen: false, client: null })}
          client={productsDialog.client}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, clientId: null, clientName: '' })}
        onConfirm={handleDelete}
        title={t('common.actions.delete')}
        message={t('common.messages.confirmation.delete', { name: deleteDialog.clientName })}
        isDeleting={isDeleting}
      />

      {/* Empty State */}
      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('common.emptyState.title')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('common.emptyState.description')}
          </p>
        </div>
      )}
    </div>
  );
}

export default ClientsTab;