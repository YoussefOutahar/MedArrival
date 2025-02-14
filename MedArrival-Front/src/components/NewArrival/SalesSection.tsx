import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as Switch from '@radix-ui/react-switch';
import { ProductDTO } from '@/models/ProductDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { ArrivalFormData, NewSaleForm, getDefaultPriceComponents, calculateTotalAmount } from '@/types/arrival.types';
import { productService } from '@/services/product.service';
import PriceComponentsSection from './PriceComponentsSection';

interface SalesSectionProps {
    newSale: NewSaleForm;
    setNewSale: React.Dispatch<React.SetStateAction<NewSaleForm>>;
    formData: ArrivalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ArrivalFormData>>;
    products: ProductDTO[];
    clients: ClientDTO[];
    onAddSale: () => void;
}

const SalesSection: React.FC<SalesSectionProps> = ({
    newSale,
    setNewSale,
    formData,
    setFormData,
    products,
    clients,
    onAddSale,
}) => {
    const { t } = useTranslation('newArrival');
    const [availableProducts, setAvailableProducts] = useState<ProductDTO[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    const fetchProductsForClient = async (selectedClient: ClientDTO | null) => {
        if (!selectedClient) {
            setAvailableProducts([]);
            setLoadingError(null);
            return;
        }

        setIsLoadingProducts(true);
        setLoadingError(null);

        try {
            if (selectedClient.clientType === 'CLIENT_RP') {
                setAvailableProducts(products);
            } else {
                const clientProducts = await productService.getProductsForClientType(selectedClient.id);
                setAvailableProducts(clientProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoadingError(t('errors.productsFetchFailed'));
            setAvailableProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        setNewSale(prev => ({ ...prev, product: null, priceComponents: [] }));
        fetchProductsForClient(newSale.client);
    }, [newSale.client]);

    const handleProductChange = (productId: string) => {
        const selectedProduct = availableProducts.find(p => p.id === Number(productId));
        if (selectedProduct) {
            const defaultPriceComponents = getDefaultPriceComponents(selectedProduct, newSale.client);
            setNewSale(prev => ({
                ...prev,
                product: selectedProduct,
                priceComponents: defaultPriceComponents
            }));
        }
    };

    const handleRemoveSale = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sales: prev.sales.filter((_, i) => i !== index),
            quantity: prev.quantity - prev.sales[index].quantity
        }));
    };

    const getTotalAmount = (sale: NewSaleForm) => {
        if (!sale.product || !sale.quantity || !sale.priceComponents.length) return 0;
        return calculateTotalAmount(sale.quantity, sale.priceComponents);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('sales.title')}
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Client Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('sales.form.client.label')}
                        </label>
                        <select
                            value={newSale.client?.id || ''}
                            onChange={(e) => {
                                const selectedClient = clients.find(c => c.id === Number(e.target.value));
                                setNewSale(prev => ({
                                    ...prev,
                                    client: selectedClient || null,
                                    product: null,
                                    priceComponents: []
                                }));
                            }}
                            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                     text-gray-900 dark:text-white rounded-lg shadow-sm 
                                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">{t('sales.form.client.placeholder')}</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {`${client.name} (${t(`clientType.${client.clientType}`)})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('sales.form.product.label')}
                        </label>
                        <div className="relative">
                            <select
                                value={newSale.product?.id || ''}
                                onChange={(e) => handleProductChange(e.target.value)}
                                disabled={!newSale.client || isLoadingProducts}
                                className={`w-full p-2.5 bg-white dark:bg-gray-700 border 
                                          ${loadingError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} 
                                          text-gray-900 dark:text-white rounded-lg shadow-sm 
                                          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                          disabled:opacity-50 disabled:cursor-not-allowed
                                          ${isLoadingProducts ? 'pl-10' : ''}`}
                            >
                                <option value="">
                                    {!newSale.client
                                        ? t('sales.form.product.selectClientFirst')
                                        : isLoadingProducts
                                            ? t('sales.form.product.loading')
                                            : availableProducts.length === 0
                                                ? t('sales.form.product.noProducts')
                                                : t('sales.form.product.placeholder')}
                                </option>
                                {availableProducts.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            {isLoadingProducts && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>

                        {loadingError && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {loadingError}
                            </p>
                        )}
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('sales.form.quantity.label')}
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={newSale.quantity || ''}
                            onChange={(e) => setNewSale(prev => ({
                                ...prev,
                                quantity: parseInt(e.target.value) || 0
                            }))}
                            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                     text-gray-900 dark:text-white rounded-lg shadow-sm 
                                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder={t('sales.form.quantity.placeholder')}
                        />
                    </div>

                    {/* Expected Delivery Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('sales.form.expectedDelivery.label')}
                        </label>
                        <input
                            type="datetime-local"
                            value={newSale.expectedDeliveryDate}
                            onChange={(e) => setNewSale(prev => ({
                                ...prev,
                                expectedDeliveryDate: e.target.value
                            }))}
                            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                     text-gray-900 dark:text-white rounded-lg shadow-sm 
                                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Conform Switch */}
                    <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('sales.form.conform.label')}
                            </label>
                            <div className="flex items-center space-x-2">
                                <Switch.Root
                                    checked={newSale.isConform}
                                    onCheckedChange={(checked) =>
                                        setNewSale(prev => ({ ...prev, isConform: checked }))
                                    }
                                    className={`w-11 h-6 rounded-full outline-none ${
                                        newSale.isConform
                                            ? 'bg-primary-600 dark:bg-primary-500'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <Switch.Thumb
                                        className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                                            newSale.isConform ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`}
                                    />
                                </Switch.Root>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {newSale.isConform
                                        ? t('sales.form.conform.conformText')
                                        : t('sales.form.conform.nonConformText')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price Components Section */}
                {newSale.product && (
                    <div className="mt-6">
                        <PriceComponentsSection
                            priceComponents={newSale.priceComponents}
                            onPriceComponentChange={(components) => 
                                setNewSale(prev => ({ ...prev, priceComponents: components }))
                            }
                        />
                    </div>
                )}

                {/* Add Sale Button */}
                <div className="flex justify-end mt-6 mb-6">
                    <button
                        type="button"
                        onClick={onAddSale}
                        disabled={!newSale.product || !newSale.client || newSale.quantity <= 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
                                 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-5 w-5" />
                        {t('sales.actions.add')}
                    </button>
                </div>

                {/* Sales Table */}
                {formData.sales.length > 0 ? (
                    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.product')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.client')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.status')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.quantity')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.totalAmount')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.expectedDelivery')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('sales.table.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {formData.sales.map((sale, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            {sale.product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            {sale.client.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full
                                                ${sale.isConform
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {sale.isConform
                                                    ? t('sales.table.conform')
                                                    : t('sales.table.nonConform')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            {sale.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            ${sale.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            {new Date(sale.expectedDeliveryDate).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSale(index)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 
                                                         dark:hover:text-red-300 p-1 rounded-full 
                                                         hover:bg-red-50 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg 
                                  border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            {t('sales.noSales.title')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('sales.noSales.description')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesSection;