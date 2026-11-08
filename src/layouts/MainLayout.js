import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../styles/MainLayout.css';

function MainLayout() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="main-layout">

            <aside className="sidebar">

                <div className="sidebar-logo">
                    <h2>SMS</h2>
                    <p>Student Management</p>
                </div>

                <div className="sidebar-menu">
                    <p className="menu-title">MENU</p>

                    <NavLink to="/" end className="menu-item">
                        <span>📊</span>
                        Dashboard
                    </NavLink>

                    {user.role === 'Admin' && (
                        <>
                            <NavLink to="/students" className="menu-item">
                                <span>👨‍🎓</span>
                                Students
                            </NavLink>

                            <NavLink to="/subjects" className="menu-item">
                                <span>📚</span>
                                Subjects
                            </NavLink>

                            <NavLink to="/grades" className="menu-item">
                                <span>📝</span>
                                Grades
                            </NavLink>

                            <NavLink to="/classes" className="menu-item">
                                <span>🏫</span>
                                Class Management
                            </NavLink>

                            <NavLink to="/users" className="menu-item">
                                <span>👥</span>
                                Users
                            </NavLink>
                        </>
                    )}

                    {user.role === 'Teacher' && (
                        <>
                            <NavLink to="/students" className="menu-item">
                                <span>👨‍🎓</span>
                                My Students
                            </NavLink>

                            <NavLink to="/grades" className="menu-item">
                                <span>📝</span>
                                Grades
                            </NavLink>
                        </>
                    )}

                    {user.role === 'User' && (
                        <NavLink to="/subjects" className="menu-item">
                            <span>📚</span>
                            Subjects
                        </NavLink>
                    )}

                    <NavLink to="/profile" className="menu-item">
                        <span>👤</span>
                        Profile
                    </NavLink>
                </div>

                <div className="sidebar-footer">
                    Student Management System
                    <small>Version 1.0</small>
                </div>

            </aside>

            <div className="main-content">

                <header className="main-header">

                    <h3>Student Management System</h3>

                    <div className="header-user">
                        <span>👤</span>

                        <div>
                            <strong>{user.name || 'Administrator'}</strong>
                            <small>{user.role || 'Admin'}</small>
                        </div>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                </header>

                <main className="page-content">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default MainLayout;