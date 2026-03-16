import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { LoadingState } from '../common/LoadingState';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, isLoading, isAdmin, isEmailVerified } = useUser();
    const location = useLocation();

    if (isLoading) {
        return <LoadingState message="Verifying access..." />;
    }

    if (!user) {
        // Redirect unauthenticated users to the homepage
        return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
    }


    if (!isEmailVerified && user.app_metadata?.provider === 'email') {
        // Redirect unverified email users to the verification page
        return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Redirect non-admins trying to access admin routes to the homepage
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
