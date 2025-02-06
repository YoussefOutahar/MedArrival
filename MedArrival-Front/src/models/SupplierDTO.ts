import { ArrivalDTO } from "./ArrivalDTO";
import { BaseDTO } from "./BaseDTO";

export interface SupplierDTO extends BaseDTO {
    name: string;
    address: string;
    phone: string;
    email: string;
    arrivals: ArrivalDTO[];
}