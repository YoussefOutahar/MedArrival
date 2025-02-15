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