import { PriceComponentDTO, PriceComponentType } from "@/models/PriceComponentDTO";

export const calculateTotalAmount = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
};

export const getCurrentPrice = (
    priceComponents: PriceComponentDTO[], 
    componentType: PriceComponentType
): number => {
    const now = new Date();
    return priceComponents
        .filter(pc => pc.componentType === componentType)
        .filter(pc => new Date(pc.effectiveFrom) <= now)
        .filter(pc => !pc.effectiveTo || new Date(pc.effectiveTo) > now)
        .map(pc => pc.amount)
        .shift() || 0;
};

export const getPriceHistory = (
    priceComponents: PriceComponentDTO[], 
    componentType: PriceComponentType
): PriceComponentDTO[] => {
    return priceComponents
        .filter(pc => pc.componentType === componentType)
        .sort((a, b) => 
            new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
        );
};

export const calculateTotalCost = (priceComponents: PriceComponentDTO[]): number => {
    const components = [
        PriceComponentType.PURCHASE_PRICE,
        PriceComponentType.TRANSPORT,
        PriceComponentType.STORAGE,
        PriceComponentType.TRANSIT,
        PriceComponentType.DUANE,
        PriceComponentType.AMSSNUR
    ];

    return components.reduce(
        (total, componentType) => total + getCurrentPrice(priceComponents, componentType),
        0
    );
};