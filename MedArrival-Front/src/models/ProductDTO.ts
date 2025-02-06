import { BaseDTO } from "./BaseDTO";
import { PriceComponentDTO } from "./PriceComponentDTO";
import { ProductCategoryDTO } from "./ProductCategoryDTO";

export interface ProductDTO extends BaseDTO {
  name: string;
  description: string;
  category: ProductCategoryDTO;
  priceComponents: PriceComponentDTO[];
  totalCost: number;
}