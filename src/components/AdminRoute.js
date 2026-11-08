import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const user = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    if (!user.id) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;