import { jwtDecode } from "jwt-decode";

function getRolesFromJwt(token: string): string[] {
    try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        // @ts-ignore
        return decoded.roles || []; // Adjust the key based on your JWT structure
    } catch (error) {
        console.error("Invalid JWT:", error);
        return [];
    }
}

function getFirstRoleFromJwt(token: string): string {
    try {
        const decoded = jwtDecode(token);
        // @ts-ignore
        const roles: string[] = decoded.roles || [];

        const rolePriority: { [key in "ROLE_ADMIN" | "ROLE_HOST" | "ROLE_USER"]: number } = {
            ROLE_ADMIN: 1,
            ROLE_HOST: 2,
            ROLE_USER: 3,
        };

        if (roles.length === 0) {
            return "";
        }

        const prioritizedRoles = roles
            .filter((role) => role in rolePriority)
            .sort(
                (a, b) =>
                    rolePriority[a as "ROLE_ADMIN" | "ROLE_HOST" | "ROLE_USER"] -
                    rolePriority[b as "ROLE_ADMIN" | "ROLE_HOST" | "ROLE_USER"]
            );

        console.log(prioritizedRoles);
        console.log(prioritizedRoles[0]);
        return prioritizedRoles[0] || "";
    } catch (error) {
        console.error("Invalid JWT:", error);
        return "";
    }
}

const getUserIdFromJwt = (token: string): number | null => {
    try {
        const decoded = jwtDecode(token) as { userId?: number };
        return decoded.userId ?? null;
    } catch {
        return null;
    }
};

export { getRolesFromJwt, getFirstRoleFromJwt, getUserIdFromJwt };
