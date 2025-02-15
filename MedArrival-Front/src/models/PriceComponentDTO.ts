import { BaseDTO } from "./BaseDTO";
import { ClientDTO } from "./ClientDTO";

export enum PriceComponentType {
    PURCHASE_PRICE = 'PURCHASE_PRICE',
    TRANSPORT = 'TRANSPORT',
    STORAGE = 'STORAGE',
    TRANSIT = 'TRANSIT',
    DUANE = 'DUANE',
    AMSSNUR = 'AMSSNUR'
}

export interface PriceComponentDTO extends BaseDTO {
    componentType: PriceComponentType;
    amount: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    client: ClientDTO | null;
    usesDefaultPrice?: boolean;
}
