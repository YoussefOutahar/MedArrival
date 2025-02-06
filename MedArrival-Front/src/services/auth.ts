import axiosInstance from "@/config/AxiosConfig";
import { AxiosHeaders, AxiosRequestConfig } from "axios";

export interface AuthError {
    message: string;
}

export const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
): Promise<{
    token: string;
    refreshToken: string;
}> => {
    const res = {
        token: "",
        refreshToken: "",
    };
    await axiosInstance
        .post(`/auth/register`, {
            firstName,
            lastName,
            email,
            password,
        })
        .then((response) => {
            res.token = response.data.token;
            res.refreshToken = response.data.refreshToken;
        })
        .catch((error) => {
            console.error(error);
        });

    return res;
};

export const signIn = async (
    email: string,
    password: string
): Promise<{ token: string; refreshToken: string }> => {
    const res = {
        token: "",
        refreshToken: "",
    };
    await axiosInstance
        .post(`/auth/authenticate`, {
            email,
            password,
        })
        .then((response) => {
            res.token = response.data.token;
            res.refreshToken = response.data.refreshToken;
        })
        .catch((error) => {
            console.error(error);
        });

    return res;
};


export interface AuthError {
    message: string;
}

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export const refreshToken = async (refreshToken: string): Promise<string> => {
    try {
        const headers = new AxiosHeaders();
        headers.set("Authorization", `Bearer ${refreshToken}`);

        const config: AxiosRequestConfig = {
            headers,
        };

        const response = await axiosInstance.post<RefreshTokenResponse>("/auth/refresh-token", {}, config);

        return response.data.accessToken;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};
