import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { kpiService } from '../services/kpi.service';
import { KpiData } from '../models/kpi/KpiData';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Card,
    Title,
    Text,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    Grid,
    Metric,
    Flex,
    ProgressBar
} from "@tremor/react";
import {
    CurrencyDollarIcon,
    ShoppingCartIcon,
    TruckIcon,
    ChartPieIcon,
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function Dashboard() {
    const { t } = useTranslation('dashboard');
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchKpiData();
        const interval = setInterval(fetchKpiData, 300000);
        return () => clearInterval(interval);
    }, []);

    const getLatestMetricValue = (data: { value: number; date: string }[] | undefined) => {
        if (!data || data.length === 0) return 0;
        return data[data.length - 1].value;
    };

    const getCategoryCount = (salesByCategory: Record<string, number> | undefined) => {
        if (!salesByCategory) return 0;
        return Object.keys(salesByCategory).length;
    };

    const fetchKpiData = async () => {
        try {
            const data = await kpiService.getDashboardData();
            setKpiData(data);
            setError(null);
        } catch (err) {
            setError(t('error.fetchFailed'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 dark:border-primary-400" />
            </div>
        );
    }

    if (error || !kpiData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Text className="text-red-600 dark:text-red-400">
                    {error ? t('error.fetchFailed') : t('error.noData')}
                </Text>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Title className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            {t('header.title')}
                        </Title>
                        <Text className="text-gray-600 dark:text-gray-400">
                            {t('header.subtitle')}
                        </Text>
                    </div>
                    <button
                        onClick={fetchKpiData}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                                 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                    >
                        {t('header.refreshButton')}
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                               transition-all duration-300 transform hover:-translate-y-1">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-3 bg-primary-500 dark:bg-primary-600 rounded-lg">
                            <CurrencyDollarIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('metrics.dailyRevenue.title')}
                            </Text>
                            <Metric className="text-2xl font-bold text-gray-900 dark:text-white">
                                {t('metrics.dailyRevenue.prefix')}
                                {getLatestMetricValue(kpiData?.dailyRevenue).toFixed(2)}
                            </Metric>
                        </div>
                    </Flex>
                </Card>

                <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                               transition-all duration-300 transform hover:-translate-y-1">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-3 bg-primary-500 dark:bg-primary-600 rounded-lg">
                            <ShoppingCartIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('metrics.dailySales.title')}
                            </Text>
                            <Metric className="text-2xl font-bold text-gray-900 dark:text-white">
                                {getLatestMetricValue(kpiData?.dailySales)}
                            </Metric>
                        </div>
                    </Flex>
                </Card>

                <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                               transition-all duration-300 transform hover:-translate-y-1">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-3 bg-primary-500 dark:bg-primary-600 rounded-lg">
                            <TruckIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('metrics.dailyArrivals.title')}
                            </Text>
                            <Metric className="text-2xl font-bold text-gray-900 dark:text-white">
                                {getLatestMetricValue(kpiData?.dailyArrivals)}
                            </Metric>
                        </div>
                    </Flex>
                </Card>

                <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                               transition-all duration-300 transform hover:-translate-y-1">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-3 bg-primary-500 dark:bg-primary-600 rounded-lg">
                            <ChartPieIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('metrics.categories.title')}
                            </Text>
                            <Metric className="text-2xl font-bold text-gray-900 dark:text-white">
                                {getCategoryCount(kpiData?.salesByCategory)}
                            </Metric>
                        </div>
                    </Flex>
                </Card>
            </div>

            {/* Tabs Section */}
            <TabGroup className="mt-6">
                <TabList className="border-b border-gray-200 dark:border-gray-700">
                    <Tab className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                  dark:hover:text-white border-b-2 border-transparent">
                        {t('tabs.revenue')}
                    </Tab>
                    <Tab className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                  dark:hover:text-white border-b-2 border-transparent">
                        {t('tabs.salesAnalysis')}
                    </Tab>
                    <Tab className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                  dark:hover:text-white border-b-2 border-transparent">
                        {t('tabs.categories')}
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* Revenue Tab */}
                    <TabPanel>
                        <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                                      transition-all duration-300">
                            <Title className="text-gray-900 dark:text-white">
                                {t('revenue.title')}
                            </Title>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('revenue.subtitle')}
                            </Text>
                            <div className="h-[400px] mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={kpiData?.dailyRevenue || []}>
                                        <CartesianGrid strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                            className="dark:stroke-gray-700" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                            stroke="#888"
                                            className="dark:text-gray-400"
                                        />
                                        <YAxis
                                            stroke="#888"
                                            className="dark:text-gray-400"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgb(255 255 255 / 0.8)',
                                                backdropFilter: 'blur(8px)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }}
                                            formatter={(value: number) => [
                                                `${t('metrics.dailyRevenue.prefix')}${value.toFixed(2)}`,
                                                t('metrics.dailyRevenue.title')
                                            ]}
                                            labelFormatter={(label) => format(
                                                new Date(label),
                                                'MMM dd, yyyy'
                                            )}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </TabPanel>

                    {/* Sales Analysis Tab */}
                    <TabPanel>
                        <Grid numItems={1} numItemsLg={2} className="gap-6">
                            {/* Top Products Card */}
                            <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                                          transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <Title className="text-gray-900 dark:text-white">
                                            {t('salesAnalysis.topProducts.title')}
                                        </Title>
                                        <Text className="text-gray-600 dark:text-gray-400">
                                            {t('salesAnalysis.topProducts.subtitle')}
                                        </Text>
                                    </div>
                                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 
                                                   dark:text-primary-400 rounded-full text-sm">
                                        {t('salesAnalysis.topProducts.timeFrame')}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {(kpiData?.topSellingProducts || []).map((product, index) => (
                                        <div key={product.productId}>
                                            <Flex className="mb-2">
                                                <div className="flex items-center">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3
                                                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                                                        {product.productName}
                                                    </Text>
                                                </div>
                                                <Text className="font-semibold text-gray-900 dark:text-white">
                                                    {t('metrics.dailyRevenue.prefix')}
                                                    {product.revenue.toFixed(2)}
                                                </Text>
                                            </Flex>
                                            <ProgressBar
                                                value={product.salesCount}
                                                className="h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Top Clients Card */}
                            <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                                          transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <Title className="text-gray-900 dark:text-white">
                                            {t('salesAnalysis.topClients.title')}
                                        </Title>
                                        <Text className="text-gray-600 dark:text-gray-400">
                                            {t('salesAnalysis.topClients.subtitle')}
                                        </Text>
                                    </div>
                                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 
                                                   dark:text-primary-400 rounded-full text-sm">
                                        {t('salesAnalysis.topClients.timeFrame')}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {(kpiData?.topClients || []).map((client, index) => (
                                        <div key={client.clientId}>
                                            <Flex className="mb-2">
                                                <div className="flex items-center">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3
                                                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                                                        {client.clientName}
                                                    </Text>
                                                </div>
                                                <Text className="font-semibold text-gray-900 dark:text-white">
                                                    {t('metrics.dailyRevenue.prefix')}
                                                    {client.totalPurchases.toFixed(2)}
                                                </Text>
                                            </Flex>
                                            <ProgressBar
                                                value={client.orderCount}
                                                className="h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Grid>
                    </TabPanel>

                    {/* Categories Tab */}
                    <TabPanel>
                        <Card className="ring-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Title className="text-gray-900 dark:text-white">
                                {t('categories.title')}
                            </Title>
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('categories.subtitle')}
                            </Text>
                            <div className="h-[400px] mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(kpiData?.salesByCategory || {}).map(([name, value]) => ({
                                                name,
                                                value
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={(entry) => entry.name}
                                            labelLine={{ stroke: '#888', strokeWidth: 1 }}
                                        >
                                            {Object.entries(kpiData?.salesByCategory || {}).map((_entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    className="dark:opacity-80"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `${t('metrics.dailyRevenue.prefix')}${value.toFixed(2)}`,
                                                ''
                                            ]}
                                            contentStyle={{
                                                backgroundColor: 'rgb(255 255 255 / 0.8)',
                                                backdropFilter: 'blur(8px)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                color: '#1f2937'
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => (
                                                <span className="text-gray-900 dark:text-gray-100">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}

export default Dashboard;