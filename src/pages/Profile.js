import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Profile.css';

function Profile() {
    const [user, setUser] = useState(null);

    const [form, setForm] = useState({
        username: '',
        name: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const currentUser = JSON.parse(
                localStorage.getItem('user') || '{}'
            );

            const response = await api.get(`/users/${currentUser.id}`);

            setUser(response.data);

            setForm({
                username: response.data.username,
                name: response.data.name,
                password: ''
            });
        } catch (error) {
            setError('Cannot load profile!');
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        try {
            const response = await api.get('/users', {
                params: {
                    username: form.username.trim()
                }
            });

            const duplicate = response.data.find(
                (u) => String(u.id) !== String(user.id)
            );

            if (duplicate) {
                setError('Username already exists!');
                return;
            }

            const updatedUser = {
                ...user,
                username: form.username.trim(),
                name: form.name.trim(),
                password: form.password
                    ? form.password
                    : user.password
            };

            await api.put(`/users/${user.id}`, updatedUser);

            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            setForm({
                ...form,
                password: ''
            });

            setMessage('Profile updated successfully!');
        } catch (error) {
            setError('Update failed!');
        }
    };

    if (!user) {
        return <div className="profile-page">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h2>My Profile</h2>
                <p>Manage your account information</p>
            </div>

            <div className="profile-card">
                <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <h3>{user.name}</h3>
                <span className="profile-role">{user.role}</span>

                <form onSubmit={handleUpdate}>
                    <div className="profile-form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="profile-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="profile-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    {message && (
                        <p className="profile-success">{message}</p>
                    )}

                    {error && (
                        <p className="profile-error">{error}</p>
                    )}

                    <button type="submit">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;