import { BaseDTO } from "./BaseDTO";
import { ClientDTO } from "./ClientDTO";
import { ProductDTO } from "./ProductDTO";

// Receipt Item DTO
export interface ReceiptItemDTO extends BaseDTO {
    product: ProductDTO;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    lotNumber?: string;
    calibrationDate?: Date;
    expirationDate?: Date;
    articleCode?: string;
    description?: string;
    unit?: string;
}

// Receipt DTO
export interface ReceiptDTO extends BaseDTO {
    receiptNumber: string;
    receiptDate: Date;
    totalAmount: number;
    iceNumber?: string;
    referenceNumber?: string;
    deliveryNoteNumbers?: string;
    tvaPercentage?: number;
    totalHT?: number;
    totalTTC?: number;
    paymentTerms?: string;
    bankAccount?: string;
    bankDetails?: string;
    issuingDepartment?: string;
    deliveryRef?: string;
    deliveryReceived?: boolean;
    client: ClientDTO;
    receiptItems: ReceiptItemDTO[];
    attachments: ReceiptAttachmentDTO[];
}

// Receipt Attachment DTO
export interface ReceiptAttachmentDTO extends BaseDTO {
    originalName: string;
    fileType: string;
    fileSize: number;
}