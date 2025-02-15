import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

// Services
import { arrivalService } from '@/services/arrival.service';
import { productService } from '@/services/product.service';
import { supplierService } from '@/services/supplier.service';
import { clientService } from '@/services/client.service';

// Types
import { ProductDTO } from '@/models/ProductDTO';
import { SupplierDTO } from '@/models/SupplierDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { SaleDTO } from '@/models/SaleDTO';
import { ArrivalFormData, NewSaleForm, PriceComponentOverride } from '@/types/arrival.types';

// Components
import ActionButtons from '@/components/NewArrival/ActionButtons';
import SalesSection from '@/components/NewArrival/SalesSection';
import BasicInformationSection from '@/components/NewArrival/BasicInformationSection';
import Header from '@/components/NewArrival/Header';

export const calculateTotalAmount = (quantity: number, priceComponents: PriceComponentOverride[]): number => {
  const componentSum = priceComponents.reduce((sum, comp) => sum + comp.amount, 0);
  return componentSum * quantity;
};

const initialArrivalFormData: ArrivalFormData = {
  invoiceNumber: '',
  arrivalDate: new Date().toISOString().slice(0, 16),
  supplier: null,
  quantity: 0,
  sales: [],
};

const initialNewSaleForm: NewSaleForm = {
  product: null,
  client: null,
  quantity: 0,
  priceComponents: [],
  isConform: true,
  expectedDeliveryDate: new Date().toISOString().slice(0, 16),
};

const NewArrival: React.FC = () => {
  const { t } = useTranslation('newArrival');
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ArrivalFormData>(initialArrivalFormData);
  const [newSale, setNewSale] = useState<NewSaleForm>(initialNewSaleForm);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
      toast.error(t('errors.fetchFailed'));
      console.error(error);
    }
  };

  const validateNewSale = (): boolean => {
    if (!newSale.product || !newSale.client) {
      toast.error(t('errors.selectProductClient'));
      return false;
    }

    if (newSale.quantity <= 0) {
      toast.error(t('errors.invalidQuantity'));
      return false;
    }

    const totalPrice = newSale.priceComponents.reduce((sum, pc) => sum + pc.amount, 0);
    if (totalPrice <= 0) {
      toast.error(t('errors.invalidPrice'));
      return false;
    }

    return true;
  };

  const handleAddSale = () => {
    if (!validateNewSale()) {
      console.warn('Sale Validation Failed');
      console.groupEnd();
      return;
    }

    const totalAmount = calculateTotalAmount(newSale.quantity, newSale.priceComponents);

    setFormData(prev => {
      const updatedSales = [...prev.sales, {
        product: newSale.product!,
        client: newSale.client!,
        quantity: newSale.quantity,
        priceComponents: newSale.priceComponents.map(pc => ({
          ...pc,
          usesDefaultPrice: false
        })),
        expectedDeliveryDate: newSale.expectedDeliveryDate,
        isConform: newSale.isConform,
        totalAmount
      }];

      return {
        ...prev,
        sales: updatedSales
      };
    });

    setNewSale(initialNewSaleForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier || formData.sales.length === 0 || !formData.invoiceNumber) {
      console.warn('Validation Failed:', {
        hasSupplier: !!formData.supplier,
        salesLength: formData.sales.length,
        invoiceNumber: formData.invoiceNumber
      });
      toast.error(t('errors.requiredFields'));
      return;
    }

    try {
      setLoading(true);

      const salesDTOs: SaleDTO[] = formData.sales.map(sale => {
        const saleDTO = {
          id: 0,
          quantity: sale.quantity,
          expectedQuantity: sale.quantity,
          totalAmount: sale.totalAmount,
          saleDate: new Date(),
          expectedDeliveryDate: new Date(sale.expectedDeliveryDate),
          isConform: sale.isConform,
          product: sale.product,
          client: sale.client,
          priceComponents: sale.priceComponents.map(pc => ({
            id: 0,
            componentType: pc.componentType,
            amount: pc.amount,
            usesDefaultPrice: pc.usesDefaultPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: '',
            updatedBy: ''
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: '',
          updatedBy: ''
        };

        return saleDTO;
      });

      const arrivalDTO = {
        id: 0,
        invoiceNumber: formData.invoiceNumber,
        arrivalDate: new Date(formData.arrivalDate),
        supplier: formData.supplier,
        sales: salesDTOs,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '',
        updatedBy: ''
      };

      await arrivalService.create(arrivalDTO);

      toast.success(t('success.created'));
      navigate('/arrivals');
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(t('errors.createFailed'));
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title={t('header.title')} onBack={() => navigate('/arrivals')} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInformationSection
            formData={formData}
            setFormData={setFormData}
            suppliers={suppliers}
          />

          <SalesSection
            newSale={newSale}
            setNewSale={setNewSale}
            formData={formData}
            setFormData={setFormData}
            products={products}
            clients={clients}
            onAddSale={handleAddSale}
          />

          <ActionButtons
            loading={loading}
            onCancel={() => navigate('/arrivals')}
          />
        </form>
      </main>
    </div>
  );
};

export default NewArrival;