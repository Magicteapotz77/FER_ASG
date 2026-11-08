import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Users.css';

function Users() {
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        id: '',
        username: '',
        password: '',
        name: '',
        role: 'User',
        assignedClass: ''
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userResponse = await api.get('/users');
            const studentResponse = await api.get('/students');

            setUsers(userResponse.data);
            setStudents(studentResponse.data);
        } catch (error) {
            setError('Cannot load data!');
        }
    };

    const classes = [
        ...new Set(
            students
                .map((student) => student.class)
                .filter(Boolean)
        )
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
            ...(name === 'role' && value !== 'Teacher'
                ? { assignedClass: '' }
                : {})
        });
    };

    const resetForm = () => {
        setForm({
            id: '',
            username: '',
            password: '',
            name: '',
            role: 'User',
            assignedClass: ''
        });

        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');

        try {
            if (form.role === 'Teacher' && !form.assignedClass) {
                setError('Please assign a class to this teacher!');
                return;
            }

            const duplicate = users.find(
                (u) =>
                    u.username.toLowerCase() ===
                        form.username.trim().toLowerCase() &&
                    String(u.id) !== String(form.id)
            );

            if (duplicate) {
                setError('Username already exists!');
                return;
            }

            const userData = {
                username: form.username.trim(),
                name: form.name.trim(),
                role: form.role,
                assignedClass: form.role === 'Teacher'
                    ? form.assignedClass
                    : ''
            };

            if (form.password.trim()) {
                userData.password = form.password;
            }

            if (form.id) {
                const oldUser = users.find(
                    (u) => String(u.id) === String(form.id)
                );

                const updatedUser = {
                    ...oldUser,
                    ...userData
                };

                await api.put(`/users/${form.id}`, updatedUser);

                const currentUser = JSON.parse(
                    localStorage.getItem('user') || '{}'
                );

                if (String(currentUser.id) === String(form.id)) {
                    localStorage.setItem(
                        'user',
                        JSON.stringify(updatedUser)
                    );
                }

                setMessage('User updated successfully!');
            } else {
                if (!form.password.trim()) {
                    setError('Please enter a password!');
                    return;
                }

                await api.post('/users', {
                    ...userData,
                    password: form.password
                });

                setMessage('User created successfully!');
            }

            resetForm();
            await loadData();
        } catch (error) {
            console.log(error);
            setError('Operation failed!');
        }
    };

    const handleEdit = (user) => {
        setForm({
            id: user.id,
            username: user.username,
            password: '',
            name: user.name,
            role: user.role,
            assignedClass: user.assignedClass || ''
        });

        setError('');
        setMessage('');
    };

    const handleDelete = async (id) => {
        const currentUser = JSON.parse(
            localStorage.getItem('user') || '{}'
        );

        if (String(currentUser.id) === String(id)) {
            alert('You cannot delete your own account!');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await api.delete(`/users/${id}`);
            await loadData();
            setMessage('User deleted successfully!');
        } catch (error) {
            setError('Delete failed!');
        }
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()) ||
        (user.assignedClass || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <h2>User Management</h2>
                    <p>Manage accounts and assign classes to teachers</p>
                </div>
            </div>

            <div className="users-form-card">
                <h3>{form.id ? 'Edit User' : 'Create New User'}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="users-form-grid">
                        <div className="users-form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="users-form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="users-form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={
                                    form.id
                                        ? 'Leave blank to keep current password'
                                        : 'Enter password'
                                }
                                required={!form.id}
                            />
                        </div>

                        <div className="users-form-group">
                            <label>Role</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Teacher">Teacher</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {form.role === 'Teacher' && (
                            <div className="users-form-group">
                                <label>Assigned Class</label>
                                <select
                                    name="assignedClass"
                                    value={form.assignedClass}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select class</option>

                                    {classes.map((className) => (
                                        <option
                                            key={className}
                                            value={className}
                                        >
                                            {className}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="users-error">{error}</p>
                    )}

                    {message && (
                        <p className="users-success">{message}</p>
                    )}

                    <div className="users-form-actions">
                        <button type="submit" className="users-save-button">
                            {form.id ? 'Update User' : 'Create User'}
                        </button>

                        {form.id && (
                            <button
                                type="button"
                                className="users-cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="users-table-card">
                <div className="users-table-header">
                    <h3>Account List</h3>

                    <input
                        type="text"
                        placeholder="Search username, name, role or class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Assigned Class</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.name}</td>
                                    <td>
                                        <span
                                            className={`role-badge ${user.role.toLowerCase()}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'Teacher'
                                            ? user.assignedClass || 'Not assigned'
                                            : '-'}
                                    </td>
                                    <td>
                                        <div className="users-actions">
                                            <button
                                                className="users-edit-button"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="users-delete-button"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="users-empty">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Users;