import { ProductDTO } from "@/models/ProductDTO";

export interface ReceiptForm {
    receiptNumber: string;
    receiptDate: string;
    iceNumber: string;
    referenceNumber: string;
    deliveryNoteNumbers: string;
    tvaPercentage: number;
    totalHT: number;
    totalTTC: number;
    paymentTerms: string;
    bankAccount: string;
    bankDetails: string;
    issuingDepartment: string;
    deliveryRef: string;
    deliveryReceived: boolean;
}

export interface ReceiptItemForm {
    product: ProductDTO | null;
    quantity: number;
    unitPrice: number;
    lotNumber: string;
    calibrationDate?: string;
    expirationDate?: string;
    articleCode: string;
    description: string;
    unit: string;
    subtotal: number;
}
