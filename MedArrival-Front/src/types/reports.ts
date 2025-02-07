export interface ReportFilter {
    startDate: string;
    endDate: string;
    supplier?: string;
    arrival?: string;
    searchTerm?: string;
}

export interface ReportType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}