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
        RECEIPTS: "/admin/receipts",
        REPORTS: "/admin/reports",
        CLIENT_RECEIPTS: "/admin/receipts/:clientId",
        ADD_RECEIPT: "/admin/receipts/:clientId/new",
        ATTACHMENTS: "/admin/receipts/:clientId/:receiptId/attachments",
        SETTINGS: {
            PRODUCTS: '/admin/settings/products',
            SUPPLIERS: '/admin/settings/suppliers',
            CLIENTS: '/admin/settings/clients',
        },
    },
} as const;
