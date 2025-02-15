import axiosInstance from "@/config/AxiosConfig";
import { PageResponse } from "@/models/PageResponse";
import { PriceComponentType } from "@/models/PriceComponentDTO";
import { ProductDTO } from "@/models/ProductDTO";

export class ProductService {
    private baseUrl = '/products';

    async getAll(page = 0, size = 10): Promise<PageResponse<ProductDTO>> {
        const response = await axiosInstance.get<PageResponse<ProductDTO>>(
            `${this.baseUrl}?page=${page}&size=${size}`
        );
        return response.data;
    }

    async getById(id: number): Promise<ProductDTO> {
        const response = await axiosInstance.get<ProductDTO>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Partial<ProductDTO>): Promise<ProductDTO> {
        const response = await axiosInstance.post<ProductDTO>(this.baseUrl, data);
        return response.data;
    }

    async update(id: number, data: Partial<ProductDTO>): Promise<ProductDTO> {
        const response = await axiosInstance.put<ProductDTO>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`${this.baseUrl}/${id}`);
    }

    // Get products for specific client (with their custom pricing if applicable)
    async getProductsForClient(clientId: number, page = 0, size = 10): Promise<PageResponse<ProductDTO>> {
        const response = await axiosInstance.get<PageResponse<ProductDTO>>(
            `${this.baseUrl}/client/${clientId}?page=${page}&size=${size}`
        );
        return response.data;
    }

    async getProductsForClientType(clientId: number | null): Promise<ProductDTO[]> {
        if (!clientId) {
          return [];
        }
        const response = await axiosInstance.get<PageResponse<ProductDTO>>(
          `/products/client/${clientId}`
        );
        return response.data.content;
      }

    // Get a specific product for a client with their pricing
    async getProductForClient(clientId: number, productId: number): Promise<ProductDTO> {
        const response = await axiosInstance.get<ProductDTO>(
            `${this.baseUrl}/client/${clientId}/product/${productId}`
        );
        return response.data;
    }

    // Set custom pricing for a client
    async setCustomPricingForClient(
        productId: number,
        clientId: number,
        priceComponents: Record<PriceComponentType, number>
    ): Promise<ProductDTO> {
        const response = await axiosInstance.post<ProductDTO>(
            `${this.baseUrl}/${productId}/client/${clientId}/pricing`,
            priceComponents
        );
        return response.data;
    }

    // Remove custom pricing for a client
    async removeCustomPricingForClient(
        productId: number,
        clientId: number
    ): Promise<ProductDTO> {
        const response = await axiosInstance.delete<ProductDTO>(
            `${this.baseUrl}/${productId}/client/${clientId}/pricing`
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

    async bulkImport(file: File): Promise<ProductDTO[]> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<ProductDTO[]>(
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
}

export const productService = new ProductService();