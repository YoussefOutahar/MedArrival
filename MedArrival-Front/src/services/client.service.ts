import axiosInstance from "@/config/AxiosConfig";
import { ClientDTO } from "@/models/ClientDTO";
import { PageResponse } from "@/models/PageResponse";

export class ClientService {
  private baseUrl = '/clients';

  async getAll(page = 0, size = 10): Promise<PageResponse<ClientDTO>> {
    const response = await axiosInstance.get<PageResponse<ClientDTO>>(
      `${this.baseUrl}?page=${page}&size=${size}`
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
}

export const clientService = new ClientService();