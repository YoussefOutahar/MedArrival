import axiosInstance from "@/config/AxiosConfig";
import { PageResponse } from "@/models/PageResponse";
import { SupplierDTO } from "@/models/SupplierDTO";

export class SupplierService {
    private baseUrl = '/suppliers';

    async getAll(page = 0, size = 10): Promise<PageResponse<SupplierDTO>> {
        const response = await axiosInstance.get<PageResponse<SupplierDTO>>(
            `${this.baseUrl}?page=${page}&size=${size}`
        );
        return response.data;
    }

    async getById(id: number): Promise<SupplierDTO> {
        const response = await axiosInstance.get<SupplierDTO>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Partial<SupplierDTO>): Promise<SupplierDTO> {
        const response = await axiosInstance.post<SupplierDTO>(this.baseUrl, data);
        return response.data;
    }

    async update(id: number, data: Partial<SupplierDTO>): Promise<SupplierDTO> {
        const response = await axiosInstance.put<SupplierDTO>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`${this.baseUrl}/${id}`);
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

    async bulkImport(file: File): Promise<SupplierDTO[]> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<SupplierDTO[]>(
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

export const supplierService = new SupplierService();