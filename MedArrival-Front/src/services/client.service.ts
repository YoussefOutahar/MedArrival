import axiosInstance from "@/config/AxiosConfig";
import { ClientDTO, ClientType } from "@/models/ClientDTO";
import { ReceiptAttachmentDTO, ReceiptDTO } from "@/models/ReceiptDTO";
import { PageResponse } from "@/models/PageResponse";
import { ProductDTO } from "@/models/ProductDTO";

interface ClientFilters {
  search?: string;
  clientType?: ClientType;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


export class ClientService {
  private baseUrl = '/clients';

  async getAll(page = 0, size = 10, filters?: ClientFilters): Promise<PageResponse<ClientDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.clientType && { clientType: filters.clientType }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });

    const response = await axiosInstance.get<PageResponse<ClientDTO>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data;
  }

  async getById(id: number): Promise<ClientDTO> {
    const response = await axiosInstance.get<ClientDTO>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: Partial<ClientDTO>): Promise<ClientDTO> {
    const response = await axiosInstance.post<ClientDTO>(this.baseUrl, data);
    return response.data;
  }

  async update(id: number, data: Partial<ClientDTO>): Promise<ClientDTO> {
    const response = await axiosInstance.put<ClientDTO>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async getByClientType(clientType: string): Promise<ClientDTO[]> {
    const response = await axiosInstance.get<ClientDTO[]>(`${this.baseUrl}/type/${clientType}`);
    return response.data;
  }

  async toggleClientType(clientId: number): Promise<ClientDTO> {
    const response = await axiosInstance.post<ClientDTO>(
      `${this.baseUrl}/${clientId}/toggle-type`
    );
    return response.data;
  }

  async bulkImport(file: File): Promise<ClientDTO[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ClientDTO[]>(
      `${this.baseUrl}/bulk-import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async downloadCsvTemplate(): Promise<Blob> {
    const response = await axiosInstance.get(`${this.baseUrl}/template/csv`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadExcelTemplate(): Promise<Blob> {
    const response = await axiosInstance.get(`${this.baseUrl}/template/excel`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async createReceipt(clientId: number, receipt: Partial<ReceiptDTO>): Promise<ReceiptDTO> {
    const response = await axiosInstance.post<ReceiptDTO>(
      `${this.baseUrl}/${clientId}/receipts`,
      receipt
    );
    return response.data;
  }

  async getClientReceipts(
    clientId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReceiptDTO[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await axiosInstance.get<ReceiptDTO[]>(
      `${this.baseUrl}/${clientId}/receipts`,
      { params }
    );
    return response.data;
  }

  async getClientReceipt(clientId: number, receiptId: number): Promise<ReceiptDTO> {
    const response = await axiosInstance.get<ReceiptDTO>(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}`
    );
    return response.data;
  }

  async updateClientReceipt(
    clientId: number,
    receiptId: number,
    receipt: Partial<ReceiptDTO>
  ): Promise<ReceiptDTO> {
    const response = await axiosInstance.put<ReceiptDTO>(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}`,
      receipt
    );
    return response.data;
  }

  async deleteClientReceipt(clientId: number, receiptId: number): Promise<void> {
    await axiosInstance.delete(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}`
    );
  }

  async addReceiptAttachment(
    clientId: number,
    receiptId: number,
    file: File
  ): Promise<ReceiptDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ReceiptDTO>(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getReceiptAttachments(
    clientId: number,
    receiptId: number
  ): Promise<ReceiptAttachmentDTO[]> {
    const response = await axiosInstance.get<ReceiptAttachmentDTO[]>(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}/attachments`
    );
    return response.data;
  }

  async downloadReceiptAttachment(
    clientId: number,
    receiptId: number,
    attachmentId: number
  ): Promise<Blob> {
    const response = await axiosInstance.get(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}/attachments/${attachmentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async deleteReceiptAttachment(
    clientId: number,
    receiptId: number,
    attachmentId: number
  ): Promise<void> {
    await axiosInstance.delete(
      `${this.baseUrl}/${clientId}/receipts/${receiptId}/attachments/${attachmentId}`
    );
  }

  async getAvailableReceiptProducts(clientId: number): Promise<ProductDTO[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/${clientId}/available-products`);
    return response.data;
}
}

export const clientService = new ClientService();