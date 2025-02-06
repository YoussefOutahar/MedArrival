import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '@/models/ProductDTO';
import { ProductCategoryDTO } from '@/models/ProductCategoryDTO';
import { PriceComponentDTO, PriceComponentType } from '@/models/PriceComponentDTO';
import { productService } from '@/services/product.service';
import { productCategoryService } from '@/services/product-category.service';
import { toast } from 'react-hot-toast';
import { TableWrapper } from '../TableWrapper';
import { FormDialog } from '../FormDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog.tsx';
import { Label } from '../ui/label.tsx';
import { cn } from '@/lib/utils.ts';
import { Textarea } from '../ui/textarea.tsx';
import { Input } from '../ui/input.tsx';
import { FileUploadButton } from '../FileUploadButton.tsx';

interface PriceInputProps {
  componentType: PriceComponentType;
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
}

function ProductsTab() {
  const { t } = useTranslation('settings');

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<ProductDTO>>({
    name: '',
    description: '',
    category: undefined,
    priceComponents: [],
    totalCost: 0,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const columns = useMemo<ColumnDef<ProductDTO>[]>(() => [
    {
      accessorKey: 'name',
      header: t('products.table.name'),
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: t('products.table.description'),
      cell: (info) => (
        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: 'category.name',
      header: t('products.table.category'),
      cell: (info) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'currentPurchasePrice',
      header: t('products.table.purchasePrice'),
      cell: (info) => (
        <div className="text-gray-900 dark:text-white">
          MAD{(info.getValue() as number)?.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'currentSellingPrice',
      header: t('products.table.sellingPrice'),
      cell: (info) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          MAD{(info.getValue() as number)?.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'totalCost',
      header: t('products.table.totalCost'),
      cell: (info) => (
        <div className="text-gray-900 dark:text-white">
          MAD{(info.getValue() as number)?.toFixed(2)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions.title'),
      cell: (info) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(info.row.original)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 
                       transition-colors p-1 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/30"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(info.row.original)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 
                       transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ], [t]);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(0, 100),
        productCategoryService.getAll(0, 100),
      ]);
      setProducts(productsRes.content);
      console.log('Products:', productsRes.content);
      setCategories(categoriesRes.content);
    } catch (error) {
      toast.error(t('common.messages.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePriceComponentChange = (
    componentType: PriceComponentType,
    amount: number
  ) => {
    const now = new Date();
    const updatedComponents = [...(currentProduct.priceComponents || [])];
  
    // Remove any existing active price components of the same type
    const filteredComponents = updatedComponents.map(component => 
      component.componentType === componentType && !component.effectiveTo
        ? { ...component, effectiveTo: now }
        : component
    );
  
    // Add the new price component
    filteredComponents.push({
      componentType,
      amount,
      effectiveFrom: now,
      effectiveTo: null,
      createdAt: now,
      updatedAt: now,
    } as PriceComponentDTO);
  
    const newProduct = {
      ...currentProduct,
      priceComponents: filteredComponents
    };
  
    // Update calculated fields
    newProduct.totalCost = calculateTotalCost(filteredComponents);
  
    setCurrentProduct(newProduct);
  };

  const getCurrentComponentPrice = (
    components: PriceComponentDTO[],
    componentType: PriceComponentType
  ): number => {
    return components
      .filter(pc => pc.componentType === componentType && !pc.effectiveTo)
      .map(pc => pc.amount)
      .shift() || 0;
  };

  const calculateTotalCost = (components: PriceComponentDTO[]): number => {
    const costComponents = [
      PriceComponentType.PURCHASE_PRICE,
      PriceComponentType.TRANSPORT,
      PriceComponentType.STORAGE,
      PriceComponentType.TRANSIT,
      PriceComponentType.DUANE,
      PriceComponentType.AMSSNUR
    ];

    return costComponents.reduce(
      (total, componentType) => total + getCurrentComponentPrice(components, componentType),
      0
    );
  };

  const PriceInput: React.FC<PriceInputProps> = ({
    componentType,
    value,
    onChange,
    tooltip
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t(`products.form.pricing.components.${componentType}`)}
        </Label>
        {tooltip && (
          <InformationCircleIcon
            className="h-4 w-4 text-gray-400 dark:text-gray-500 
                     hover:text-gray-500 dark:hover:text-gray-400"
            title={tooltip}
          />
        )}
      </div>
      <div className="relative">
        <NumericFormat
          defaultValue={value}
          getInputRef={(el: { className: string; }) => {
            if (el) {
              el.className = "h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed";
            }
          }}
          onValueChange={(values) => {
            if (values.floatValue !== undefined) {
              onChange(values.floatValue);
            }
          }}
          thousandSeparator=","
          decimalSeparator="."
          prefix="MAD "
          decimalScale={2}
          allowNegative={false}
          placeholder="MAD 0.00"
        />
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct.name || !currentProduct.category) {
      toast.error(t('common.messages.errors.required'));
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await productService.update(currentProduct.id!, currentProduct);

        // console.log('Product updated:', currentProduct);
        toast.success(t('common.messages.success.updated'));
      } else {
        await productService.create(currentProduct);
        toast.success(t('common.messages.success.created'));
      }
      setIsModalOpen(false);
      await fetchData();
      resetForm();
    } catch (error) {
      toast.error(t(isEditing ? 'common.messages.errors.updateFailed' : 'common.messages.errors.createFailed'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: ProductDTO) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: ProductDTO) => {
    setDeleteDialog({
      isOpen: true,
      productId: product.id,
      productName: product.name,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.productId) return;

    try {
      setIsDeleting(true);
      await productService.delete(deleteDialog.productId);
      toast.success(t('common.messages.success.deleted'));
      await fetchData();
    } catch (error) {
      toast.error(t('common.messages.errors.deleteFailed'));
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, productId: null, productName: '' });
    }
  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      description: '',
      category: undefined,
      priceComponents: [],
      totalCost: 0,
    });
    setIsEditing(false);
  };

  const handleDownloadTemplate = async (type: 'csv' | 'excel') => {
    try {
      const blob = type === 'csv'
        ? await productService.downloadCsvTemplate()
        : await productService.downloadExcelTemplate();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-template.${type === 'csv' ? 'csv' : 'xlsx'}`);
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
      const importedProducts = await productService.bulkImport(file);
      toast.success(t('common.messages.success.imported', { count: importedProducts.length }));
      await fetchData();
    } catch (error) {
      toast.error(t('common.messages.errors.importFailed'));
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading && products.length === 0) {
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
            {t('products.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            {t('products.description')}
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
            {t('products.buttons.add')}
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
                            className="py-3.5 px-4 text-left text-sm font-semibold 
                                     text-gray-900 dark:text-white"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 
                                  bg-white dark:bg-gray-800">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="whitespace-nowrap py-4 px-4 text-sm 
                                     text-gray-500 dark:text-gray-400"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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
            className="inline-flex items-center px-3 py-2 border border-gray-300 
                     dark:border-gray-600 shadow-sm text-sm font-medium rounded-md 
                     text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                     hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-primary-500 dark:focus:ring-offset-gray-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            {t('common.pagination.previous')}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 
                     dark:border-gray-600 shadow-sm text-sm font-medium rounded-md 
                     text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                     hover:bg-gray-50 dark:hover:bg-gray-700/50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-primary-500 dark:focus:ring-offset-gray-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
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
          ? t('products.form.title.edit', { name: currentProduct.name })
          : t('products.form.title.add')}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('products.form.fields.name.label')}
            </Label>
            <Input
              id="productName"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({
                ...currentProduct,
                name: e.target.value,
              })}
              className="h-12 w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('products.form.fields.name.placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('products.form.fields.description.label')}
            </Label>
            <Textarea
              id="description"
              value={currentProduct.description}
              onChange={(e) => setCurrentProduct({
                ...currentProduct,
                description: e.target.value,
              })}
              className="min-h-[120px] w-full rounded-md 
                       border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
              placeholder={t('products.form.fields.description.placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('products.form.fields.category.label')}
            </Label>
            <Select<ProductCategoryDTO>
              value={categories.find((c) => c.id === currentProduct.category?.id)}
              onChange={(selected) => setCurrentProduct({
                ...currentProduct,
                category: selected || undefined,
              })}
              options={categories}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id.toString()}
              classNames={{
                control: (state) => cn(
                  "h-12 w-full rounded-md",
                  "bg-white dark:bg-gray-800",
                  "border border-gray-300 dark:border-gray-700",
                  state.isFocused && "border-primary-500 dark:border-primary-400"
                ),
                menu: () => "bg-white dark:bg-gray-800 border dark:border-gray-700",
                option: (state) => cn(
                  "text-gray-900 dark:text-gray-100",
                  state.isFocused && "bg-gray-100 dark:bg-gray-700",
                  state.isSelected && "bg-primary-500 text-white"
                ),
                singleValue: () => "text-gray-900 dark:text-gray-100",
                input: () => "text-gray-900 dark:text-gray-100",
              }}
              placeholder={t('products.form.fields.category.placeholder')}
              isClearable
              required
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('products.form.pricing.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(PriceComponentType) as Array<keyof typeof PriceComponentType>)
                .filter((key) => isNaN(Number(key)))
                .map((key) => {
                  const componentType = PriceComponentType[key] as PriceComponentType;
                  return (
                    <PriceInput
                      key={componentType}
                      componentType={componentType}
                      label={t(`products.form.pricing.components.${componentType}`)}
                      value={getCurrentComponentPrice(currentProduct.priceComponents || [], componentType)}
                      onChange={(value) => handlePriceComponentChange(componentType, value)}
                      tooltip={
                        componentType === PriceComponentType.PURCHASE_PRICE
                          ? t('products.form.pricing.sellingPriceTooltip')
                          : undefined
                      }
                    />
                  );
                }

                )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('products.form.pricing.totalCost')}:
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  MAD{currentProduct.totalCost?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 
                       rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-700/50 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              {t('common.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white 
                       bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                       dark:hover:bg-primary-600 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-primary-500
                       dark:focus:ring-offset-gray-900 disabled:opacity-50 
                       disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? t('common.status.updating') : t('common.status.creating')}
                </div>
              ) : (
                isEditing ? t('common.actions.update') : t('common.actions.add')
              )}
            </button>
          </div>
        </form>
      </FormDialog>


      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: null, productName: '' })}
        onConfirm={handleDelete}
        title={t('common.actions.delete')}
        message={t('common.messages.confirmation.delete', { name: deleteDialog.productName })}
        isDeleting={isDeleting}
      />

      {/* Empty State */}
      {products.length === 0 && !loading && (
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
              {t('products.buttons.add')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsTab;