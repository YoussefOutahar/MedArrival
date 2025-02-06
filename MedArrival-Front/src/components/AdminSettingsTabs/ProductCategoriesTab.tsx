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
import { ProductCategoryDTO } from '@/models/ProductCategoryDTO';
import { productCategoryService } from '@/services/product-category.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { TableWrapper } from '../TableWrapper';
import { FormDialog } from '../FormDialog';
import { FormButton } from '../FormButton';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog.tsx';
import { Label } from '../ui/label.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Input } from '../ui/input.tsx';

function ProductCategoriesTab() {
  const { t } = useTranslation('settings');

  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<ProductCategoryDTO>>({
    name: '',
    description: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: t('categories.table.name'),
      cell: (info: any) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: t('categories.table.description'),
      cell: (info: any) => (
        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {info.getValue() || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'productCount',
      header: t('categories.table.products'),
      cell: (info: any) => (
        <div className="text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
            {info.getValue()} {t('categories.table.products').toLowerCase()}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('categories.table.actions'),
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
            disabled={info.row.original.productCount > 0}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 
                     transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            title={info.row.original.productCount > 0 ?
              t('categories.messages.deleteError') : t('common.actions.delete')}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ] as const, [t]);

  const table = useReactTable({
    data: categories,
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await productCategoryService.getAll(0, 100);
      setCategories(response.content);
    } catch (error) {
      toast.error(t('common.messages.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCategory.name) {
      toast.error(t('common.messages.errors.required'));
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await productCategoryService.update(currentCategory.id!, currentCategory);
        toast.success(t('common.messages.success.updated'));
      } else {
        await productCategoryService.create(currentCategory);
        toast.success(t('common.messages.success.created'));
      }
      setIsModalOpen(false);
      await fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(t(isEditing ? 'common.messages.errors.updateFailed' : 'common.messages.errors.createFailed'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: ProductCategoryDTO) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: ProductCategoryDTO) => {
    if (category.productCount && category.productCount > 0) {
      toast.error(t('categories.messages.deleteError'));
      return;
    }

    setDeleteDialog({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.categoryId) return;

    try {
      setIsDeleting(true);
      await productCategoryService.delete(deleteDialog.categoryId);
      toast.success(t('common.messages.success.deleted'));
      await fetchCategories();
    } catch (error) {
      toast.error(t('common.messages.errors.deleteFailed'));
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, categoryId: null, categoryName: '' });
    }
  };

  const resetForm = () => {
    setCurrentCategory({
      name: '',
      description: '',
    });
    setIsEditing(false);
  };

  if (loading && categories.length === 0) {
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
            {t('categories.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            {t('categories.description')}
          </p>
        </div>
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
          {t('categories.form.title.add')}
        </button>
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
          ? t('categories.form.title.edit', { name: currentCategory.name })
          : t('categories.form.title.add')}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('categories.form.fields.name.label')}
            </Label>
            <Input
              id="name"
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              className="h-12 w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('categories.form.fields.name.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('categories.form.fields.description.label')}
            </Label>
            <Textarea
              id="description"
              value={currentCategory.description}
              onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
              className="min-h-[120px] w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('categories.form.fields.description.placeholder')}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, categoryId: null, categoryName: '' })}
        onConfirm={handleDelete}
        title={t('common.actions.delete')}
        message={t('common.messages.confirmation.delete', { name: deleteDialog.categoryName })}
        isDeleting={isDeleting}
      />

      {/* Empty State */}
      {categories.length === 0 && !loading && (
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
              {t('categories.form.title.add')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCategoriesTab;