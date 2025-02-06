import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { SupplierDTO } from '@/models/SupplierDTO';
import { supplierService } from '@/services/supplier.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { TableWrapper } from '../TableWrapper';
import { FormDialog } from '../FormDialog';
import { FormButton } from '../FormButton';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog.tsx';
import { Label } from '../ui/label.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { FileUploadButton } from '../FileUploadButton.tsx';

function SuppliersTab() {
  const { t } = useTranslation('settings');

  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<SupplierDTO>>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    supplierId: number | null;
    supplierName: string;
  }>({
    isOpen: false,
    supplierId: null,
    supplierName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: t('suppliers.table.companyName'),
      cell: (info: any) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: t('suppliers.table.email'),
      cell: (info: any) => (
        <div className="text-gray-500 dark:text-gray-400">
          <a href={`mailto:${info.getValue()}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {info.getValue()}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: t('suppliers.table.phone'),
      cell: (info: any) => (
        <div className="text-gray-500 dark:text-gray-400">
          <a href={`tel:${info.getValue()}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {info.getValue()}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: t('suppliers.table.address'),
      cell: (info: any) => (
        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {info.getValue()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('suppliers.table.actions'),
      cell: (info: any) => (
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
  ] as const, [t]);

  const table = useReactTable({
    data: suppliers,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll(0, 100);
      setSuppliers(response.content);
    } catch (error) {
      toast.error(t('common.messages.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSupplier.name || !currentSupplier.email || !currentSupplier.phone || !currentSupplier.address) {
      toast.error(t('common.messages.errors.required'));
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(currentSupplier.email)) {
      toast.error(t('suppliers.form.fields.email.error'));
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await supplierService.update(currentSupplier.id!, currentSupplier);
        toast.success(t('common.messages.success.updated'));
      } else {
        await supplierService.create(currentSupplier);
        toast.success(t('common.messages.success.created'));
      }
      setIsModalOpen(false);
      await fetchSuppliers();
      resetForm();
    } catch (error) {
      toast.error(t(isEditing ? 'common.messages.errors.updateFailed' : 'common.messages.errors.createFailed'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier: SupplierDTO) => {
    setCurrentSupplier(supplier);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier: SupplierDTO) => {
    setDeleteDialog({
      isOpen: true,
      supplierId: supplier.id,
      supplierName: supplier.name,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.supplierId) return;

    try {
      setIsDeleting(true);
      await supplierService.delete(deleteDialog.supplierId);
      toast.success(t('common.messages.success.deleted'));
      await fetchSuppliers();
    } catch (error) {
      toast.error(t('common.messages.errors.deleteFailed'));
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, supplierId: null, supplierName: '' });
    }
  };

  const resetForm = () => {
    setCurrentSupplier({
      name: '',
      address: '',
      phone: '',
      email: '',
    });
    setIsEditing(false);
  };

  const handleDownloadTemplate = async (type: 'csv' | 'excel') => {
    try {
      const blob = type === 'csv' 
        ? await supplierService.downloadCsvTemplate()
        : await supplierService.downloadExcelTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `supplier-template.${type === 'csv' ? 'csv' : 'xlsx'}`);
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
      const importedSuppliers = await supplierService.bulkImport(file);
      toast.success(t('common.messages.success.imported', { count: importedSuppliers.length }));
      await fetchSuppliers();
    } catch (error) {
      toast.error(t('common.messages.errors.importFailed'));
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading && suppliers.length === 0) {
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
            {t('suppliers.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            {t('suppliers.description')}
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
            {t('suppliers.import.csv')}
          </button>
          <button
            onClick={() => handleDownloadTemplate('excel')}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 
                     rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     dark:focus:ring-offset-gray-900 transition-colors"
          >
            {t('suppliers.import.excel')}
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
            {t('suppliers.buttons.add')}
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
          ? t('suppliers.form.title.edit', { name: currentSupplier.name })
          : t('suppliers.form.title.add')}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('suppliers.form.fields.companyName.label')}
            </Label>
            <Input
              id="companyName"
              value={currentSupplier.name}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
              className="h-12 w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('suppliers.form.fields.companyName.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('suppliers.form.fields.email.label')}
            </Label>
            <Input
              id="email"
              type="email"
              value={currentSupplier.email}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
              className="h-12 w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('suppliers.form.fields.email.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('suppliers.form.fields.phone.label')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={currentSupplier.phone}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
              className="h-12 w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('suppliers.form.fields.phone.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('suppliers.form.fields.address.label')}
            </Label>
            <Textarea
              id="address"
              value={currentSupplier.address}
              onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
              className="min-h-[120px] w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('suppliers.form.fields.address.placeholder')}
              required
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
              {isEditing ? t('suppliers.buttons.update') : t('suppliers.buttons.add')}
            </FormButton>
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, supplierId: null, supplierName: '' })}
        onConfirm={handleDelete}
        title={t('common.actions.delete')}
        message={t('common.messages.confirmation.delete', { name: deleteDialog.supplierName })}
        isDeleting={isDeleting}
      />

      {/* Empty State */}
      {suppliers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 
                         flex items-center justify-center mb-4">
              <PlusIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('common.emptyState.title')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('common.emptyState.description')}
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white 
                       bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                       dark:hover:bg-primary-600 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-primary-500
                       dark:focus:ring-offset-gray-900 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('suppliers.buttons.add')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuppliersTab;