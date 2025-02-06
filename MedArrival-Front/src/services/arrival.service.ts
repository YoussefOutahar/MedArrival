import axiosInstance from "@/config/AxiosConfig";
import { ArrivalDTO } from "@/models/ArrivalDTO";
import { PageResponse } from "@/models/PageResponse";

export class ArrivalService {
  private baseUrl = '/arrivals';

  async getAll(page = 0, size = 10): Promise<PageResponse<ArrivalDTO>> {
    const response = await axiosInstance.get<PageResponse<ArrivalDTO>>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getById(id: number): Promise<ArrivalDTO> {
    const response = await axiosInstance.get<ArrivalDTO>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: Partial<ArrivalDTO>): Promise<ArrivalDTO> {
    const response = await axiosInstance.post<ArrivalDTO>(this.baseUrl, data);
    return response.data;
  }

  async update(id: number, data: Partial<ArrivalDTO>): Promise<ArrivalDTO> {
    const response = await axiosInstance.put<ArrivalDTO>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async findBySupplier(supplierId: number): Promise<ArrivalDTO[]> {
    const response = await axiosInstance.get<ArrivalDTO[]>(`${this.baseUrl}/supplier/${supplierId}`);
    return response.data;
  }

  async findByDateRange(start: Date, end: Date): Promise<ArrivalDTO[]> {
    const response = await axiosInstance.get<ArrivalDTO[]>(`${this.baseUrl}/date-range`, {
      params: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
    return response.data;
  }
}

export const arrivalService = new ArrivalService();