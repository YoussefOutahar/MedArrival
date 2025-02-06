import { AUTH_STORAGE_KEYS } from "@/services/LocalStorage/Types/AuthStorageTypes";

export const authStorage = {
    setUser: (user: any): void => {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        }
    },

    getToken: (): string | null => localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN),

    getRefreshToken: (): string | null => localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),

    getRole: (): string | null => localStorage.getItem(AUTH_STORAGE_KEYS.ROLE),

    getUserId: (): number | null => {
        const userId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
        return userId ? parseInt(userId) : null;
    },

    getUser: (): any | null => {
        const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    setToken: (token: string | null): void => {
        if (token) {
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        }
    },

    setRefreshToken: (token: string | null): void => {
        if (token) {
            localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        }
    },

    setRole: (role: string | null): void => {
        if (role) {
            localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, role);
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
        }
    },

    setUserId: (userId: number | null): void => {
        if (userId !== null) {
            localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userId.toString());
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER_ID);
        }
    },

    clearAuth: (): void => {
        Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    },
};
