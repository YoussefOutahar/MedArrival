import { BaseDTO } from "./BaseDTO";
import { ClientDTO } from "./ClientDTO";
import { ProductDTO } from "./ProductDTO";

// Receipt Item DTO
export interface ReceiptItemDTO extends BaseDTO {
    product: ProductDTO;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    lotNumber: string | null;
    calibrationDate: Date | null;
    expirationDate: Date | null;
    articleCode: string | null;
    description: string | null;
    unit: string | null;
}

// Receipt DTO
export interface ReceiptDTO extends BaseDTO {
    receiptNumber: string;
    receiptDate: Date;
    totalAmount: number;
    iceNumber: string | null;
    referenceNumber: string | null;
    deliveryNoteNumbers: string | null;
    tvaPercentage: number | null;
    totalHT: number | null;
    totalTTC: number | null;
    paymentTerms: string | null;
    bankAccount: string | null;
    bankDetails: string | null;
    issuingDepartment: string | null;
    deliveryRef: string | null;
    deliveryReceived: boolean | null;
    client: ClientDTO;
    receiptItems: ReceiptItemDTO[];
    attachments: ReceiptAttachmentDTO[];
}

// Receipt Attachment DTO
export interface ReceiptAttachmentDTO extends BaseDTO {
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number; 
}