import { BaseDTO } from "./BaseDTO";
import { PriceComponentDTO } from "./PriceComponentDTO";

export interface ProductDTO extends BaseDTO {
  name: string;
  description: string;
  priceComponents: PriceComponentDTO[];
  availableQuantity: number;
  totalCost: number;
}