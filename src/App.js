
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Classes from './pages/Classes';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Subjects from './pages/Subjects';
import Grades from './pages/Grades';
import Users from './pages/Users';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetail />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/grades" element={<Grades />} />

                    <Route
                        path="/users"
                        element={
                            <AdminRoute>
                                <Users />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/classes"
                        element={
                            <AdminRoute>
                                <Classes />
                            </AdminRoute>
                        }
                    />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
