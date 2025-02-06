export const PATHS = {
    HOME: "/",

    AUTH: {
        SIGN_IN: "/auth/signin",
        SIGN_UP: "/auth/signup",
        FORGOT_PASSWORD: "/auth/forgot-password",
    },

    ADMIN: {
        INDEX: "/admin",
        DASHBOARD: "/admin/dashboard",
        ARRIVALS: "/admin/arrivals",
        NEW_ARRIVAL: "/admin/new-arrival",
        REPORTS: "/admin/reports",
        SETTINGS: {
            PRODUCTS: '/admin/settings/products',
            CATEGORIES: '/admin/settings/categories',
            SUPPLIERS: '/admin/settings/suppliers',
            CLIENTS: '/admin/settings/clients',
        },
    },
} as const;
