import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

const withAuth = (WrappedComponent) => {
  return function WithAuth(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const verifyAuth = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          router.replace('/login');
          return;
        }

        try {
          // Make a test request to verify token validity
          await api.get(`/api/users/${userId}`);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Clear invalid credentials
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.replace('/login');
        } finally {
          setIsLoading(false);
        }
      };

      verifyAuth();
    }, [router]);

    // Show nothing while checking auth
    if (isLoading) {
      return null;
    }

    // Only render the component when authenticated
    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
