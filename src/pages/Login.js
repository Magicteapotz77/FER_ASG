import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await api.get('/users');

        const account = response.data.find(
            (user) =>
                user.username.trim().toLowerCase() === username.trim().toLowerCase() &&
                user.password === password
        );

        if (!account) {
            setError('Username or password is incorrect!');
            return;
        }

        localStorage.setItem('user', JSON.stringify(account));

        navigate('/');
    } catch (error) {
        console.log(error);
        setError('Cannot connect to server!');
    }
};

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    <h1>SMS</h1>
                    <p>Student Management System</p>
                </div>

                <div className="login-heading">
                    <h2>Welcome Back</h2>
                    <p>Please login to your account</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                <div className="login-demo">
                    Demo: admin / 123456
                </div>

            </div>
        </div>
    );
}

export default Login;