import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      // If we have currentUser in context, we're good
      if (currentUser) {
        setIsLoading(false);
        return;
      }

      // If no currentUser, check if token exists and validate it
      try {
        // You can add an API call to verify token if needed
        // const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/auth/verify`);
        // setCurrentUser(data.user);
        
        // For now, just check if we have any user data in localStorage as fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear any invalid data
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [currentUser, setCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;