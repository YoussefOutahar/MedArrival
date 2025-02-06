import { CategorySales } from "./CategorySales";
import { ClientMetric } from "./ClientMetric";
import { DailyMetric } from "./DailyMetric";
import { ProductMetric } from "./ProductMetric";

export interface KpiData {
    dailyRevenue: DailyMetric[];
    dailySales: DailyMetric[];
    dailyArrivals: DailyMetric[];
    topSellingProducts: ProductMetric[];
    topClients: ClientMetric[];
    salesByCategory: CategorySales;
}