import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { ProductDTO } from '@/models/ProductDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { productService } from '@/services/product.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { PriceComponentType } from '@/models/PriceComponentDTO';
import { ButtonUI } from '@/components/ui/button-ui';
import { Pagination } from '@/components/ui/pagination';
import { PageResponse } from '@/models/PageResponse';
import { ProductPriceCard } from './ProductPriceCard';

interface ClientProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDTO;
}

export function ClientProductsDialog({ isOpen, onClose, client }: ClientProductsDialogProps) {
  const { t } = useTranslation('settings');
  const [pageResponse, setPageResponse] = useState<PageResponse<ProductDTO>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true
  });
  const [loading, setLoading] = useState(true);
  const [updatingPrice, setUpdatingPrice] = useState<Record<string, boolean>>({});
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClientProducts();
    }
  }, [isOpen, client.id, pageResponse.number]);

  const fetchClientProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductsForClient(
        client.id!,
        pageResponse.number,
        pageResponse.size
      );
      setPageResponse(response);

      const initialPrices: Record<string, number> = {};
      response.content.forEach(product => {
        product.priceComponents?.forEach(component => {
          if (component.componentType) {
            const key = `${product.id}-${component.componentType}`;
            initialPrices[key] = component.amount;
          }
        });
      });
      setEditingPrices(initialPrices);
    } catch (error) {
      toast.error(t('common.messages.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await productService.downloadPriceComponentsExcel(client.id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `price-components-${client.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error(t('common.messages.errors.downloadFailed'));
      console.error(error);
    }
  };

  const handleUploadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await productService.uploadPriceComponentsExcel(client.id!, file);
      toast.success(t('common.messages.success.uploaded'));
      await fetchClientProducts(); // Refresh the list after upload
    } catch (error) {
      toast.error(t('common.messages.errors.uploadFailed'));
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };

  const filteredProducts = searchTerm
    ? pageResponse.content.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : pageResponse.content;

  const handlePageChange = (pageNumber: number) => {
    setPageResponse(prev => ({ ...prev, number: pageNumber - 1 }));
  };

  const handlePriceUpdate = async (productId: number, componentType: PriceComponentType) => {
    const key = `${productId}-${componentType}`;
    try {
      setUpdatingPrice(prev => ({ ...prev, [key]: true }));
      const priceComponents = {
        [componentType]: editingPrices[key]
      } as Record<PriceComponentType, number>;

      const updatedProduct = await productService.setCustomPricingForClient(
        productId,
        client.id!,
        priceComponents
      );

      const newPrices = { ...editingPrices };
      updatedProduct.priceComponents?.forEach(component => {
        if (component.componentType) {
          const priceKey = `${productId}-${component.componentType}`;
          newPrices[priceKey] = component.amount;
        }
      });
      setEditingPrices(newPrices);

      toast.success(t('common.messages.success.updated'));
      await fetchClientProducts();
    } catch (error) {
      toast.error(t('common.messages.errors.updateFailed'));
      console.error(error);
    } finally {
      setUpdatingPrice(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRevertToDefault = async (productId: number) => {
    try {
      setUpdatingPrice(prev => ({ ...prev, [`${productId}-all`]: true }));

      const beforeProduct = pageResponse.content.find(p => p.id === productId);

      await productService.removeCustomPricingForClient(productId, client.id!);

      const updatedProduct = await productService.getProductForClient(client.id!, productId);

      const newPrices = { ...editingPrices };
      updatedProduct.priceComponents?.forEach(component => {
        if (component.componentType) {
          const key = `${productId}-${component.componentType}`;
          newPrices[key] = component.amount;
        }
      });
      setEditingPrices(newPrices);

      await fetchClientProducts();
      toast.success(t('common.messages.success.reverted'));
    } catch (error) {
      toast.error(t('common.messages.errors.revertFailed'));
      console.error(error);
    } finally {
      setUpdatingPrice(prev => ({ ...prev, [`${productId}-all`]: false }));
    }
  };

  const priceTypes = Object.values(PriceComponentType) as PriceComponentType[];

  const priceComponentLabels: Record<PriceComponentType, string> = {
    [PriceComponentType.PURCHASE_PRICE]: t('products.priceComponents.purchasePrice'),
    [PriceComponentType.TRANSPORT]: t('products.priceComponents.transport'),
    [PriceComponentType.STORAGE]: t('products.priceComponents.storage'),
    [PriceComponentType.TRANSIT]: t('products.priceComponents.transit'),
    [PriceComponentType.DUANE]: t('products.priceComponents.duane'),
    [PriceComponentType.AMSSNUR]: t('products.priceComponents.amssnur')
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl 
                                   bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="flex flex-col h-[80vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 
                              dark:border-gray-700">
                    <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                      {t('clients.products.title', { client: client.name })}
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      {/* Download Excel button */}
                      <ButtonUI
                        onClick={handleDownloadExcel}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        {t('common.actions.download')}
                      </ButtonUI>

                      {/* Upload Excel button */}
                      <ButtonUI
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('excel-upload')?.click()}
                      >
                        <ArrowUpTrayIcon className="h-5 w-5" />
                        {t('common.actions.upload')}
                      </ButtonUI>

                      {/* Hidden file input */}
                      <input
                        id="excel-upload"
                        type="file"
                        className="hidden"
                        accept=".xlsx"
                        onChange={handleUploadExcel}
                      />

                      {/* Close button */}
                      <ButtonUI
                        onClick={onClose}
                        variant="outline"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                               dark:hover:text-gray-200"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </ButtonUI>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 
                              bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 
                                                    h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="text"
                          placeholder={t('common.search')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-700 border-gray-300 
                                 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.pagination.showing', {
                          from: pageResponse.number * pageResponse.size + 1,
                          to: Math.min((pageResponse.number + 1) * pageResponse.size, pageResponse.totalElements),
                          total: pageResponse.totalElements
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                                      border-primary-600 dark:border-primary-400" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                          <InboxIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchTerm ? t('common.noSearchResults') : t('clients.products.noProducts.title')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">
                            {searchTerm ? t('common.tryDifferentSearch') : t('clients.products.noProducts.description')}
                          </p>
                        </div>
                      ) : (
                        filteredProducts.map(product => (
                          <ProductPriceCard
                            key={product.id}
                            product={product}
                            priceTypes={priceTypes}
                            priceComponentLabels={priceComponentLabels}
                            editingPrices={editingPrices}
                            setEditingPrices={setEditingPrices}
                            handlePriceUpdate={handlePriceUpdate}
                            updatingPrice={updatingPrice}
                            handleRevertToDefault={handleRevertToDefault}
                            t={t}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-t 
                              border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={pageResponse.number + 1}
                        totalPages={pageResponse.totalPages}
                        onPageChange={handlePageChange}
                        hasNextPage={!pageResponse.last}
                        hasPrevPage={!pageResponse.first}
                      />
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}