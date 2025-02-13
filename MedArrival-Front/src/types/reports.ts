export interface ReportFilter {
    startDate: string;
    endDate: string;
    supplier?: string;
    arrival?: string;
    client?: number;
    searchTerm: string;
  }

export interface ReportType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}