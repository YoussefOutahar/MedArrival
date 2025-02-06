import { BaseDTO } from "./BaseDTO";
import { SaleDTO } from "./SaleDTO";
import { SupplierDTO } from "./SupplierDTO";

export interface ArrivalDTO extends BaseDTO {
    arrivalDate: Date;
    invoiceNumber: string;
    sales: SaleDTO[];
    supplier: SupplierDTO;
}