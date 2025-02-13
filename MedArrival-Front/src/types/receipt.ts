import { ProductDTO } from "@/models/ProductDTO";

export interface ReceiptForm {
    receiptNumber: string;
    receiptDate: string;
    iceNumber: string | null;
    referenceNumber: string | null;
    deliveryNoteNumbers: string | null;
    tvaPercentage: number;
    paymentTerms: string | null;
    bankAccount: string | null;
    bankDetails: string | null;
    issuingDepartment: string | null;
    deliveryRef: string | null;
    deliveryReceived: boolean | null;
}

export interface ReceiptItemForm {
    product: ProductDTO | null;
    quantity: number;
    unitPrice: number;
    lotNumber: string | null;
    calibrationDate: string | null;
    expirationDate: string | null;
    articleCode: string | null;
    description: string | null;
    unit: string | null;
    subtotal: number;
}