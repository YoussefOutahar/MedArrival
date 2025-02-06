import axiosInstance from '@/config/AxiosConfig';
import { KpiData } from '../models/kpi/KpiData';

const API_URL = '/kpis';

class KpiService {
    async getDashboardData(): Promise<KpiData> {
        try {
            const response = await axiosInstance.get<KpiData>(`${API_URL}/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching KPI data:', error);
            throw error;
        }
    }
}

export const kpiService = new KpiService();