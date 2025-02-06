import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AuthError,
  signUp as signUpService,
  signIn as signInService,
} from '@/services/auth';
import { getFirstRoleFromJwt, getUserIdFromJwt } from '@/utils/jwt-utils';
import { authStorage } from '@/services/LocalStorage/AuthStorage';

const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleAuthError = (error: unknown) => {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    setError({ message: errorMessage });
    setLoading(false);
  };

  const signUp = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { token: newToken, refreshToken: newRefreshToken } = await signUpService(firstName, lastName, email, password);
      authStorage.setToken(newToken);
      authStorage.setRefreshToken(newRefreshToken);
      authStorage.setRole(getFirstRoleFromJwt(newToken));
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, refreshToken } = await signInService(email, password);
      authStorage.setToken(newToken);
      authStorage.setRefreshToken(refreshToken);
      authStorage.setRole(getFirstRoleFromJwt(newToken));
      authStorage.setUserId(getUserIdFromJwt(newToken));
      authStorage.setUserId(getUserIdFromJwt(newToken));
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      authStorage.clearAuth();
      navigate('/auth/signin', { replace: true });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return authStorage.getToken() !== null && authStorage.getRole() !== null ;
  };

  return {
    user: authStorage.getUser(), 
    userId: authStorage.getUserId(),
    token: authStorage.getToken(),
    role: authStorage.getRole(),
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    signUp,
    signIn,
    signOut,
  };
};

export default useAuth;