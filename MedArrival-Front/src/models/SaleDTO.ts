import { BaseDTO } from "./BaseDTO";
import { ClientDTO } from "./ClientDTO";
import { ProductDTO } from "./ProductDTO";

export enum PriceComponentType {
    PURCHASE_PRICE = 'PURCHASE_PRICE',
    TRANSPORT = 'TRANSPORT',
    STORAGE = 'STORAGE',
    TRANSIT = 'TRANSIT',
    DUANE = 'DUANE',
    AMSSNUR = 'AMSSNUR'
}

export interface SalePriceComponentDTO extends BaseDTO {
    componentType: PriceComponentType;
    amount: number;
    usesDefaultPrice: boolean;
}

export interface SaleDTO extends BaseDTO {
    quantity: number;
    expectedQuantity: number;
    totalAmount: number;
    saleDate: Date;
    expectedDeliveryDate: Date;
    isConform: boolean;
    product: ProductDTO;
    client: ClientDTO;
    priceComponents: SalePriceComponentDTO[];
}