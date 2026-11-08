import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Subjects.css';

function Subjects() {
    const [subjects, setSubjects] = useState([]);

    const [form, setForm] = useState({
        subjectCode: '',
        subjectName: '',
        credits: 3
    });

    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');

    const loadSubjects = () => {
        api.get('/subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({
            subjectCode: '',
            subjectName: '',
            credits: 3
        });

        setEditId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            ...form,
            credits: Number(form.credits)
        };

        if (editId) {
            api.put(`/subjects/${editId}`, data)
                .then(() => {
                    alert('Update successfully!');
                    resetForm();
                    loadSubjects();
                })
                .catch(err => console.log(err));
        } else {
            api.post('/subjects', data)
                .then(() => {
                    alert('Add successfully!');
                    resetForm();
                    loadSubjects();
                })
                .catch(err => console.log(err));
        }
    };

    const handleEdit = (subject) => {
        setForm({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            credits: subject.credits
        });

        setEditId(subject.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            api.delete(`/subjects/${id}`)
                .then(() => {
                    alert('Delete successfully!');
                    loadSubjects();
                })
                .catch(err => console.log(err));
        }
    };

    const filteredSubjects = subjects.filter(s =>
        (s.subjectCode || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.subjectName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="subjects-page">
            <div className="subjects-container">

                <div className="subjects-header">
                    <div>
                        <h1>Subject Management</h1>
                        <p>Manage subjects and course information</p>
                    </div>

                    <div className="total-subjects">
                        Total Subjects: {subjects.length}
                    </div>
                </div>

                <div className="subject-form-card">
                    <h3>{editId ? 'Edit Subject' : 'Add New Subject'}</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="subject-form-grid">

                            <div className="subject-form-group">
                                <label>Subject Code *</label>
                                <input
                                    name="subjectCode"
                                    placeholder="Enter subject code"
                                    value={form.subjectCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="subject-form-group">
                                <label>Subject Name *</label>
                                <input
                                    name="subjectName"
                                    placeholder="Enter subject name"
                                    value={form.subjectName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="subject-form-group">
                                <label>Credits *</label>
                                <input
                                    type="number"
                                    name="credits"
                                    min="1"
                                    value={form.credits}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <div className="subject-form-buttons">
                            <button type="submit" className="subject-btn-primary">
                                {editId ? 'Update Subject' : 'Add Subject'}
                            </button>

                            <button
                                type="button"
                                className="subject-btn-cancel"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div className="subject-list-card">

                    <div className="subject-list-header">
                        <div>
                            <h3>Subject List</h3>
                            <p>{filteredSubjects.length} subjects found</p>
                        </div>

                        <input
                            className="subject-search"
                            placeholder="Search by code or name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="subject-table-container">
                        <table className="subjects-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Credits</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSubjects.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td className="subject-code">{s.subjectCode}</td>
                                        <td className="subject-name">{s.subjectName}</td>
                                        <td>{s.credits}</td>
                                        <td>
                                            <div className="subject-actions">
                                                <button
                                                    className="subject-btn-edit"
                                                    onClick={() => handleEdit(s)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="subject-btn-delete"
                                                    onClick={() => handleDelete(s.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredSubjects.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="subject-empty">
                                            No subjects found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Subjects;