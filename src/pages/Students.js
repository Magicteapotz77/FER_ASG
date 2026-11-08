
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Students.css';

function Students() {
    const currentUser = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    const isAdmin = currentUser.role === 'Admin';
    const isTeacher = currentUser.role === 'Teacher';
    const isUser = currentUser.role === 'User';

    const assignedClass = currentUser.assignedClass || '';

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);

    const [form, setForm] = useState({
        studentCode: '',
        name: '',
        gender: 'Male',
        dateOfBirth: '',
        email: '',
        phone: '',
        major: '',
        class: isTeacher ? assignedClass : '',
        status: 'Active'
    });

    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const requests = [
                api.get('/students'),
                api.get('/classes')
            ];

            const [studentRes, classRes] = await Promise.all(requests);

            let studentData = studentRes.data;

            if (isTeacher) {
                studentData = studentData.filter(
                    student => student.class === assignedClass
                );
            }

            setStudents(studentData);
            setClasses(classRes.data);

        } catch (error) {
            console.log(error);
            alert('Cannot load students or classes!');
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({
            studentCode: '',
            name: '',
            gender: 'Male',
            dateOfBirth: '',
            email: '',
            phone: '',
            major: '',
            class: isTeacher ? assignedClass : '',
            status: 'Active'
        });

        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Chỉ Admin được thêm sinh viên
        if (!editId && !isAdmin) {
            alert('Only Admin can add new students!');
            return;
        }

        if (isTeacher && !assignedClass) {
            alert('You have not been assigned to any class!');
            return;
        }

        const studentData = {
            ...form,
            class: isTeacher ? assignedClass : form.class
        };

        // Kiểm tra lớp có tồn tại hay không
        const selectedClass = classes.find(
            item => item.className === studentData.class
        );

        if (!selectedClass) {
            alert('Please select an existing class!');
            return;
        }

        try {
            if (editId) {
                const currentStudent = students.find(
                    student => String(student.id) === String(editId)
                );

                if (!currentStudent) {
                    alert('Student not found!');
                    return;
                }

                if (
                    isTeacher &&
                    currentStudent.class !== assignedClass
                ) {
                    alert('You cannot update students from another class!');
                    return;
                }

                await api.patch(`/students/${editId}`, studentData);

                alert('Update student successfully!');

            } else {
                if (!isAdmin) {
                    alert('Only Admin can add new students!');
                    return;
                }

                await api.post('/students', studentData);

                alert('Add student successfully!');
            }

            resetForm();
            await loadData();

        } catch (error) {
            console.log(error);
            alert('Cannot save student!');
        }
    };

    const handleEdit = (student) => {
        if (!isAdmin && !isTeacher) {
            return;
        }

        if (
            isTeacher &&
            student.class !== assignedClass
        ) {
            alert('You cannot edit students from another class!');
            return;
        }

        setForm({
            studentCode: student.studentCode || '',
            name: student.name || '',
            gender: student.gender || 'Male',
            dateOfBirth: student.dateOfBirth || '',
            email: student.email || '',
            phone: student.phone || '',
            major: student.major || '',
            class: student.class || '',
            status: student.status || 'Active'
        });

        setEditId(student.id);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (id) => {
        if (!isAdmin && !isTeacher) {
            return;
        }

        const student = students.find(
            item => String(item.id) === String(id)
        );

        if (!student) return;

        if (
            isTeacher &&
            student.class !== assignedClass
        ) {
            alert('You cannot delete students from another class!');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${student.name}?`
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/students/${id}`);

            alert('Delete student successfully!');

            if (String(editId) === String(id)) {
                resetForm();
            }

            await loadData();

        } catch (error) {
            console.log(error);
            alert('Cannot delete student!');
        }
    };

    const filteredStudents = students.filter(student =>
        (student.name || '')
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (student.studentCode || '')
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="students-page">

            <div className="students-container">

                <div className="students-header">
                    <div>
                        <h1>Student Management</h1>

                        <p>
                            {isTeacher
                                ? `Manage students in class ${assignedClass}`
                                : 'Manage student information and academic records'}
                        </p>
                    </div>

                    <div className="total-students">
                        Total Students: {filteredStudents.length}
                    </div>
                </div>

                {isTeacher && !assignedClass && (
                    <div className="empty-message">
                        You have not been assigned to any class.
                        Please contact Admin.
                    </div>
                )}

                {/* Form chỉ hiển thị cho Admin hoặc Teacher đang sửa */}
                {(isAdmin || (isTeacher && editId)) && (
                    <div className="student-form-card">

                        <h3>
                            {editId ? 'Edit Student' : 'Add New Student'}
                        </h3>

                        <form onSubmit={handleSubmit}>

                            <div className="student-form-grid">

                                <div className="form-group">
                                    <label>Student Code *</label>
                                    <input
                                        name="studentCode"
                                        placeholder="Enter student code"
                                        value={form.studentCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Student Name *</label>
                                    <input
                                        name="name"
                                        placeholder="Enter student name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Major</label>
                                    <input
                                        name="major"
                                        placeholder="Enter major"
                                        value={form.major}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Class *</label>

                                    {isTeacher ? (
                                        <input
                                            name="class"
                                            value={assignedClass}
                                            readOnly
                                        />
                                    ) : (
                                        <select
                                            name="class"
                                            value={form.class}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select Class
                                            </option>

                                            {classes.map(item => (
                                                <option
                                                    key={item.id}
                                                    value={item.className}
                                                >
                                                    {item.className}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                            </div>

                            <div className="form-buttons">

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isAdmin && classes.length === 0}
                                >
                                    {editId ? 'Update Student' : 'Add Student'}
                                </button>

                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                            </div>

                            {isAdmin && classes.length === 0 && (
                                <p className="empty-message">
                                    No classes available. Please create a class first.
                                </p>
                            )}

                        </form>

                    </div>
                )}

                <div className="student-list-card">

                    <div className="list-header">
                        <div>
                            <h3>Student List</h3>
                            <p>{filteredStudents.length} students found</p>
                        </div>

                        <input
                            className="search-input"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="table-container">

                        <table className="students-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Email</th>
                                    <th>Major</th>
                                    <th>Class</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.map(student => (
                                    <tr key={student.id}>

                                        <td>{student.id}</td>

                                        <td className="student-code">
                                            {student.studentCode}
                                        </td>

                                        <td className="student-name">
                                            {student.name}
                                        </td>

                                        <td>{student.gender}</td>
                                        <td>{student.email}</td>
                                        <td>{student.major}</td>
                                        <td>{student.class}</td>

                                        <td>
                                            <span
                                                className={
                                                    student.status === 'Active'
                                                        ? 'status-active'
                                                        : 'status-inactive'
                                                }
                                            >
                                                {student.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">

                                                <Link
                                                    to={`/students/${student.id}`}
                                                    className="btn-view"
                                                >
                                                    View
                                                </Link>

                                                {(isAdmin || isTeacher) && (
                                                    <>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(student)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDelete(student.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="empty-message">
                                            No students found
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

export default Students;
