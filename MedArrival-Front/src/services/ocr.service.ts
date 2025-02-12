import axiosInstance from "@/config/AxiosConfig";

export class OcrService {
    private baseUrl = '/ocr';

    async performOcr(file: File, language: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);

        const response = await axiosInstance.post<string>(
            `${this.baseUrl}/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async clearCache(cacheName: string): Promise<string> {
        const response = await axiosInstance.post<string>(
            `${this.baseUrl}/cache/clear/${cacheName}`
        );
        return response.data;
    }

    async clearAllCaches(): Promise<string> {
        const response = await axiosInstance.post<string>(
            `${this.baseUrl}/cache/clear-all`
        );
        return response.data;
    }
}

export const ocrService = new OcrService();