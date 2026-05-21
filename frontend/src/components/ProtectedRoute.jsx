import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, token, isAdmin } = useAuth();

    if (token && !user) {
        return (
            <div className="aura-profile-page text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--rose-deep)' }} />
                <p className="mt-3 text-muted">Đang xác thực phiên đăng nhập...</p>
            </div>
        );
    }

    if (!user || !token) {
        return <Navigate to="/login" replace state={{ from: adminOnly ? '/admin/profile' : '/user/profile' }} />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/user/profile" replace />;
    }

    return children;
};

export default ProtectedRoute;
