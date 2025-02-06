import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authStorage } from './services/LocalStorage/AuthStorage';
import LoadingSpinner from './components/LoadingSpinner';

interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const DEFAULT_REDIRECTS = {
    ROLE_USER: '/',
} as const;

const PUBLIC_PATHS = [
    '/',
    '/auth/signin',
    '/auth/forgot-password',
];

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = authStorage.getToken();
    const role = authStorage.getRole();

    const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

    useEffect(() => {
        if (token && role && isPublicPath) {
            navigate(DEFAULT_REDIRECTS[role as keyof typeof DEFAULT_REDIRECTS] || '/', { replace: true });
        }
    }, [token, role, location]);

    if (isPublicPath) {
        return <>{children}</>;
    }

    if (token === undefined) {
        return <LoadingSpinner fullScreen />;
    }

    if (!token) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    if (!allowedRoles) {
        return <>{children}</>;
    }

    if (!allowedRoles.includes(role || '')) {
        return <Navigate to={DEFAULT_REDIRECTS[role as keyof typeof DEFAULT_REDIRECTS] || '/'} replace />;
    }

    return <>{children}</>;
};

export default AuthGuard;