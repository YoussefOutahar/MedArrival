import { ProductDTO } from '@/models/ProductDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { SupplierDTO } from '@/models/SupplierDTO';
import { PriceComponentType } from '@/models/PriceComponentDTO';

export interface PriceComponentOverride {
  componentType: PriceComponentType;
  amount: number;
  usesDefaultPrice: boolean;
}

export interface SaleFormData {
  product: ProductDTO;
  client: ClientDTO;
  quantity: number;
  priceComponents: PriceComponentOverride[];
  expectedDeliveryDate: string;
  isConform: boolean;
  totalAmount: number;
}

export interface ArrivalFormData {
  invoiceNumber: string;
  arrivalDate: string;
  supplier: SupplierDTO | null;
  quantity: number;
  sales: SaleFormData[];
}

export interface NewSaleForm {
  product: ProductDTO | null;
  client: ClientDTO | null;
  quantity: number;
  priceComponents: PriceComponentOverride[];
  expectedDeliveryDate: string;
  isConform: boolean;
}

export const calculateTotalAmount = (quantity: number, priceComponents: PriceComponentOverride[]): number => {
  const componentSum = priceComponents.reduce((sum, comp) => sum + comp.amount, 0);
  return componentSum * quantity;
};

export const getDefaultPriceComponents = (product: ProductDTO | null, client: ClientDTO | null): PriceComponentOverride[] => {
  if (!product) return [];

  return Object.values(PriceComponentType).map(type => {
    let amount = 0;
    if (client && client.clientType === 'CLIENT_MARCHER') {
      // Try to find client-specific price first
      const clientPrice = product.priceComponents.find(pc => 
        pc.componentType === type && 
        pc.client?.id === client.id && 
        (!pc.effectiveTo || new Date(pc.effectiveTo) > new Date())
      );
      if (clientPrice) {
        amount = clientPrice.amount;
      }
    }
    
    if (amount === 0) {
      // Use default price if no client-specific price found
      const defaultPrice = product.priceComponents.find(pc => 
        pc.componentType === type && 
        !pc.client && 
        (!pc.effectiveTo || new Date(pc.effectiveTo) > new Date())
      );
      amount = defaultPrice?.amount || 0;
    }

    return {
      componentType: type,
      amount,
      usesDefaultPrice: true
    };
  });
};