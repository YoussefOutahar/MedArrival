import { lazy } from 'react';
import { PATHS } from './paths';

// Auth pages
const Auth = lazy(() => import('@/pages/auth/Auth'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Admin pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Arrivals = lazy(() => import('@/pages/Arrivals'));
const NewArrival = lazy(() => import('@/pages/NewArrival'));
const Reports = lazy(() => import('@/pages/Reports'));

// Admin Settings pages
const Products = lazy(() => import('@/pages/settings/Products'));
const Categories = lazy(() => import('@/pages/settings/Categories'));
const Suppliers = lazy(() => import('@/pages/settings/Suppliers'));
const Clients = lazy(() => import('@/pages/settings/Clients'));

export const publicRoutes = [
    { path: PATHS.AUTH.SIGN_IN, element: <Auth /> },
    { path: PATHS.AUTH.FORGOT_PASSWORD, element: <ForgotPassword /> },
];

export const adminRoutes = [
    { path: PATHS.ADMIN.INDEX, element: <Dashboard />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.ARRIVALS, element: <Arrivals />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.NEW_ARRIVAL, element: <NewArrival />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.REPORTS, element: <Reports />, role: 'ROLE_ADMIN' },

    // Admin Settings Routes
    { path: PATHS.ADMIN.SETTINGS.PRODUCTS, element: <Products />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.SETTINGS.CATEGORIES, element: <Categories />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.SETTINGS.SUPPLIERS, element: <Suppliers />, role: 'ROLE_ADMIN' },
    { path: PATHS.ADMIN.SETTINGS.CLIENTS, element: <Clients />, role: 'ROLE_ADMIN' },
];



// Combine all routes
export const allRoutes = [
    ...publicRoutes,
    ...adminRoutes,
];

// Helper type for routes
export type AppRoute = {
    path: string;
    element: React.ReactNode;
    role?: string;
};
