import axiosInstance from "@/config/AxiosConfig";

export class ReportService {
  private baseUrl = '/reports';

  async downloadInvoiceExcel(invoiceNumber: string): Promise<Blob> {
    const response = await axiosInstance.get(`${this.baseUrl}/invoice/${invoiceNumber}/excel`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadProductSummaryReport(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await axiosInstance.get(`${this.baseUrl}/pricing-report?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadMonthlyProductReport(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await axiosInstance.get(`${this.baseUrl}/monthly-product-report?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadClientSalesForecast(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await axiosInstance.get(`${this.baseUrl}/client-sales-forecast?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportAll(startDate: string, endDate: string): Promise<Blob> {
    const formattedStartDate = `${startDate}T00:00:00`;
    const formattedEndDate = `${endDate}T23:59:59`;
    
    const params = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate
    });

    const response = await axiosInstance.get(`${this.baseUrl}/export-all?${params.toString()}`, {
        responseType: 'blob'
    });
    return response.data;
}
}

export const reportService = new ReportService();