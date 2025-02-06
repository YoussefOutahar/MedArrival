import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { arrivalService } from '@/services/arrival.service';
import { productService } from '@/services/product.service';
import { supplierService } from '@/services/supplier.service';
import { clientService } from '@/services/client.service';
import { ProductDTO } from '@/models/ProductDTO';
import { SupplierDTO } from '@/models/SupplierDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { SaleDTO } from '@/models/SaleDTO';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface NewArrivalFormData {
  invoiceNumber: string;
  arrivalDate: string;
  supplier: SupplierDTO | null;
  quantity: number;
  sales: Array<{
    product: ProductDTO;
    client: ClientDTO;
    quantity: number;
    unitPrice: number;
    sellingPriceOverride: boolean;
    expectedDeliveryDate: string;
    totalAmount: number;
    saleDate?: Date;
  }>;
}

interface NewSaleForm {
  product: ProductDTO | null;
  client: ClientDTO | null;
  quantity: number;
  unitPrice: number;
  sellingPriceOverride: boolean;
  expectedDeliveryDate: string;
}

function NewArrival() {
  const { t } = useTranslation('newArrival');
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<NewArrivalFormData>({
    invoiceNumber: '',
    arrivalDate: new Date().toISOString().slice(0, 16),
    supplier: null,
    quantity: 0,
    sales: [],
  });

  const [newSale, setNewSale] = useState<NewSaleForm>({
    product: null,
    client: null,
    quantity: 0,
    unitPrice: 0,
    sellingPriceOverride: false,
    expectedDeliveryDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersResponse, productsResponse, clientsResponse] = await Promise.all([
          supplierService.getAll(),
          productService.getAll(),
          clientService.getAll()
        ]);
        setSuppliers(suppliersResponse.content);
        setProducts(productsResponse.content);
        setClients(clientsResponse.content);
      } catch (error) {
        toast.error('errors.fetchFailed');
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === Number(productId));
    if (selectedProduct) {
      setNewSale(prev => ({
        ...prev,
        product: selectedProduct,
        unitPrice: selectedProduct.currentSellingPrice || 0,
        sellingPriceOverride: false
      }));
    }
  };

  const handlePriceOverrideChange = (checked: boolean) => {
    if (!newSale.product) return;

    setNewSale(prev => ({
      ...prev,
      sellingPriceOverride: checked,
      unitPrice: checked ? prev.unitPrice : (prev.product?.currentSellingPrice || 0)
    }));
  };

  const handleUnitPriceChange = (price: number) => {
    setNewSale(prev => ({
      ...prev,
      unitPrice: price,
      sellingPriceOverride: true
    }));
  };

  const handleAddSale = () => {
    console.log('Current newSale state:', newSale);

    if (!newSale.product || !newSale.client) {
      toast.error('errors.selectProductClient');
      return;
    }

    if (newSale.quantity <= 0) {
      toast.error('errors.invalidQuantity');
      return;
    }

    if (newSale.unitPrice <= 0) {
      toast.error('errors.invalidPrice');
      return;
    }

    const totalAmount = newSale.quantity * newSale.unitPrice;

    const saleToAdd = {
      product: newSale.product,
      client: newSale.client,
      quantity: newSale.quantity,
      unitPrice: newSale.unitPrice,
      sellingPriceOverride: newSale.sellingPriceOverride,
      expectedDeliveryDate: newSale.expectedDeliveryDate,
      totalAmount
    };

    setFormData(prev => ({
      ...prev,
      sales: [...prev.sales, saleToAdd]
    }));

    // Reset the form
    setNewSale({
      product: null,
      client: null,
      quantity: 0,
      unitPrice: 0,
      sellingPriceOverride: false,
      expectedDeliveryDate: new Date().toISOString().slice(0, 16)
    });
  };

  const handleRemoveSale = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sales: prev.sales.filter((_, i) => i !== index),
      quantity: prev.quantity - prev.sales[index].quantity
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier || formData.sales.length === 0 || !formData.invoiceNumber) {
      toast.error('errors.requiredFields');
      return;
    }

    try {
      setLoading(true);

      const salesDTOs: SaleDTO[] = formData.sales.map(sale => ({
        id: 0,
        quantity: sale.quantity,
        expectedQuantity: sale.quantity,
        unitPrice: sale.unitPrice,
        totalAmount: sale.totalAmount,
        sellingPriceOverride: sale.sellingPriceOverride,
        saleDate: new Date(),
        expectedDeliveryDate: new Date(sale.expectedDeliveryDate),
        product: sale.product,
        client: sale.client,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '',
        updatedBy: ''
      }));

      await arrivalService.create({
        id: 0,
        invoiceNumber: formData.invoiceNumber,
        arrivalDate: new Date(formData.arrivalDate),
        quantity: formData.quantity,
        supplier: formData.supplier,
        sales: salesDTOs,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '',
        updatedBy: ''
      });

      toast.success('success.created');
      navigate('/arrivals');
    } catch (error) {
      toast.error('errors.createFailed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/arrivals')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('header.title')}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('basicInfo.title')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Invoice Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('basicInfo.invoiceNumber.label')}
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('basicInfo.invoiceNumber.placeholder')}
                    required
                  />
                </div>

                {/* Supplier Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('basicInfo.supplier.label')}
                  </label>
                  <select
                    value={formData.supplier?.id || ''}
                    onChange={(e) => {
                      const supplier = suppliers.find(s => s.id === Number(e.target.value));
                      setFormData({ ...formData, supplier: supplier || null });
                    }}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">{t('basicInfo.supplier.placeholder')}</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrival Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('basicInfo.arrivalDate.label')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Section */}
          <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('sales.title')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                {/* Product Select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('sales.form.product.label')}
                  </label>
                  <select
                    value={newSale.product?.id || ''}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{t('sales.form.product.placeholder')}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.currentSellingPrice?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('sales.form.client.label')}
                  </label>
                  <select
                    value={newSale.client?.id || ''}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === Number(e.target.value));
                      setNewSale(prev => ({
                        ...prev,
                        client: selectedClient || null
                      }));
                    }}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{t('sales.form.client.placeholder')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('sales.form.quantity.label')}
                  </label>
                  <input
                    type="number"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({
                      ...newSale,
                      quantity: parseInt(e.target.value) || 0,
                    })}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                  />
                </div>

                {/* Unit Price Section */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('sales.form.unitPrice.label')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSale.sellingPriceOverride}
                        onChange={(e) => handlePriceOverrideChange(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('sales.form.unitPrice.override')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={newSale.unitPrice}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    disabled={!newSale.sellingPriceOverride}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    min="0"
                    step="0.01"
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
                    onChange={(e) => setNewSale({
                      ...newSale,
                      expectedDeliveryDate: e.target.value,
                    })}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Add Sale Button */}
                <div className="md:col-span-6">
                  <button
                    type="button"
                    onClick={handleAddSale}
                    className="w-full flex items-center justify-center gap-2 p-2.5 
                             bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                  >
                    <Plus className="h-5 w-5" />
                    {t('sales.form.addButton')}
                  </button>
                </div>
              </div>

              {/* Sales Table or No Sales Message */}
              {formData.sales.length > 0 ? (
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.product')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.client')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.quantity')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.unitPrice')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.totalAmount')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.expectedDelivery')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
                          {t('sales.table.priceStatus')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 
                                     uppercase tracking-wider">
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
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            ${sale.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            ${sale.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {new Date(sale.expectedDeliveryDate).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.sellingPriceOverride ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                                           font-medium bg-yellow-100 dark:bg-yellow-900/30 
                                           text-yellow-800 dark:text-yellow-500">
                                {t('sales.table.customPrice')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                                           font-medium bg-green-100 dark:bg-green-900/30 
                                           text-green-800 dark:text-green-500">
                                {t('sales.table.defaultPrice')}
                              </span>
                            )}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/arrivals')}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 
                       dark:bg-primary-500 dark:hover:bg-primary-600 
                       text-white rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('actions.creating')}
                </div>
              ) : (
                t('actions.create')
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default NewArrival;