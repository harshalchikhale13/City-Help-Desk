import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="sidebar">
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="sidebar-logo-link">
                <div className="sidebar-header">
                    <div className="logo-icon">🎓</div>
                    <div className="logo-text">Campus Help</div>
                </div>
            </Link>

            <div className="user-info">
                <div className="user-avatar">
                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-role">{user.role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* Dashboard & Reporting */}
                <div className="nav-group">
                    <span className="nav-label">Main</span>

                    <NavLink
                        to={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end
                    >
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </NavLink>

                    {user.role === 'admin' && (
                        <NavLink to="/admin/issues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">📑</span>
                            <span>Issues Management</span>
                        </NavLink>
                    )}

                    {(user.role === 'student' || user.role === 'staff') && (
                        <NavLink to="/complaint/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">➕</span>
                            <span>Report Issue</span>
                        </NavLink>
                    )}
                </div>

                {/* Admin Management Group */}
                {user.role === 'admin' && (
                    <div className="nav-group">
                        <span className="nav-label">Admin Control</span>

                        <NavLink
                            to="/admin/users"
                            className={`nav-item ${location.pathname === '/admin/users' && (!location.search || location.search.includes('tab=students')) ? 'active' : ''}`}
                        >
                            <span className="nav-icon">👥</span>
                            <span>User Management</span>
                        </NavLink>

                        <NavLink
                            to="/admin/users?tab=staff"
                            className={`nav-item ${location.search.includes('tab=staff') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">👮</span>
                            <span>Staff Management</span>
                        </NavLink>

                        <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">📈</span>
                            <span>System Analytics</span>
                        </NavLink>
                    </div>
                )}

                {/* Account & System */}
                <div className="nav-group">
                    <span className="nav-label">SYSTEM</span>
                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">⚙️</span>
                        <span>My Profile</span>
                    </NavLink>
                    <button onClick={handleLogout} className="nav-item logout-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', background: 'transparent' }}>
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
