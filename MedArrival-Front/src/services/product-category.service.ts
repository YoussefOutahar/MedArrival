import axiosInstance from "@/config/AxiosConfig";
import { PageResponse } from "@/models/PageResponse";
import { ProductCategoryDTO } from "@/models/ProductCategoryDTO";

export class ProductCategoryService {
    private baseUrl = '/categories';

    async getAll(page = 0, size = 10): Promise<PageResponse<ProductCategoryDTO>> {
        const response = await axiosInstance.get<PageResponse<ProductCategoryDTO>>(
            `${this.baseUrl}?page=${page}&size=${size}`
        );
        return response.data;
    }

    async getById(id: number): Promise<ProductCategoryDTO> {
        const response = await axiosInstance.get<ProductCategoryDTO>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Partial<ProductCategoryDTO>): Promise<ProductCategoryDTO> {
        const response = await axiosInstance.post<ProductCategoryDTO>(this.baseUrl, data);
        return response.data;
    }

    async update(id: number, data: Partial<ProductCategoryDTO>): Promise<ProductCategoryDTO> {
        const response = await axiosInstance.put<ProductCategoryDTO>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`${this.baseUrl}/${id}`);
    }
}

export const productCategoryService = new ProductCategoryService();