import axiosInstance from "@/config/AxiosConfig";
import { PageResponse } from "@/models/PageResponse";
import { SaleDTO } from "@/models/SaleDTO";

export class SaleService {
    private baseUrl = '/sales';

    async getAll(page = 0, size = 10): Promise<PageResponse<SaleDTO>> {
        const response = await axiosInstance.get<PageResponse<SaleDTO>>(
            `${this.baseUrl}?page=${page}&size=${size}`
        );
        return response.data;
    }

    async getById(id: number): Promise<SaleDTO> {
        const response = await axiosInstance.get<SaleDTO>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Partial<SaleDTO>): Promise<SaleDTO> {
        const response = await axiosInstance.post<SaleDTO>(this.baseUrl, data);
        return response.data;
    }

    async update(id: number, data: Partial<SaleDTO>): Promise<SaleDTO> {
        const response = await axiosInstance.put<SaleDTO>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`${this.baseUrl}/${id}`);
    }

    async findByClient(clientId: number): Promise<SaleDTO[]> {
        const response = await axiosInstance.get<SaleDTO[]>(`${this.baseUrl}/client/${clientId}`);
        return response.data;
    }

    async findByProduct(productId: number): Promise<SaleDTO[]> {
        const response = await axiosInstance.get<SaleDTO[]>(`${this.baseUrl}/product/${productId}`);
        return response.data;
    }
}

export const saleService = new SaleService();