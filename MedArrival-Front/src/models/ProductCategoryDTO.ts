import { BaseDTO } from "./BaseDTO";

export interface ProductCategoryDTO extends BaseDTO {
    name: string;
    description: string;
    productCount: number;
}
    