import { BaseDTO } from "./BaseDTO";
import { ClientDTO } from "./ClientDTO";
import { ProductDTO } from "./ProductDTO";

export interface SaleDTO extends BaseDTO {
    quantity: number;
    expectedQuantity: number;
    totalAmount: number;
    saleDate: Date;
    expectedDeliveryDate: Date;
    product: ProductDTO;
    client: ClientDTO;
}