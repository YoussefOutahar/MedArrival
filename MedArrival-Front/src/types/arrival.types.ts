import { ProductDTO } from '@/models/ProductDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { SupplierDTO } from '@/models/SupplierDTO';
import { PriceComponentType } from '@/models/PriceComponentDTO';

export interface SaleFormData {
  product: ProductDTO;
  client: ClientDTO;
  quantity: number;
  unitPrice: number;
  sellingPriceOverride: boolean;
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
  unitPrice: number;
  sellingPriceOverride: boolean;
  expectedDeliveryDate: string;
  isConform: boolean;
}

// Helper function to get current selling price from product
export const getCurrentSellingPrice = (product: ProductDTO): number => {
  const purchasePriceComponent = product.priceComponents.find(
    pc => pc.componentType === PriceComponentType.PURCHASE_PRICE &&
         (!pc.effectiveTo || new Date(pc.effectiveTo) > new Date())
  );
  return purchasePriceComponent?.amount || 0;
};