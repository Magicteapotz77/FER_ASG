import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Classes.css';

function Classes() {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);

    const [form, setForm] = useState({
        id: '',
        className: '',
        teacherId: ''
    });

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [classRes, userRes, studentRes] = await Promise.all([
                api.get('/classes'),
                api.get('/users'),
                api.get('/students')
            ]);

            setClasses(classRes.data);
            setTeachers(
                userRes.data.filter(user => user.role === 'Teacher')
            );
            setStudents(studentRes.data);
        } catch (err) {
            setError('Cannot load class data!');
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
            id: '',
            className: '',
            teacherId: ''
        });

        setSelectedStudentId('');
    };

    const handleEdit = (item) => {
        setForm({
            id: item.id,
            className: item.className,
            teacherId: item.teacherId || ''
        });

        setSelectedStudentId('');
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const className = form.className.trim();

        if (!className) {
            setError('Please enter class name!');
            return;
        }

        const oldClass = classes.find(item => item.id === form.id);
        const oldClassName = oldClass?.className || '';

        const duplicate = classes.some(
            item =>
                item.className.toLowerCase() === className.toLowerCase() &&
                item.id !== form.id
        );

        if (duplicate) {
            setError('This class already exists!');
            return;
        }

        const selectedTeacher = teachers.find(
            teacher => teacher.id === form.teacherId
        );

        if (form.teacherId && !selectedTeacher) {
            setError('Selected teacher does not exist!');
            return;
        }

        if (selectedTeacher) {
            const assignedClass = selectedTeacher.assignedClass || '';

            const assignedRecord = classes.find(
                item =>
                    item.teacherId === selectedTeacher.id &&
                    item.id !== form.id
            );

            if (
                (assignedClass &&
                    assignedClass !== oldClassName &&
                    assignedClass !== className) ||
                assignedRecord
            ) {
                setError('This teacher is already assigned to another class!');
                return;
            }
        }

        try {
            const classData = {
                className,
                teacherId: form.teacherId
            };

            if (form.id) {
                await api.patch(`/classes/${form.id}`, classData);

                // Update students when class name changes
                if (oldClassName && oldClassName !== className) {
                    const classStudents = students.filter(
                        student => student.class === oldClassName
                    );

                    await Promise.all(
                        classStudents.map(student =>
                            api.patch(`/students/${student.id}`, {
                                class: className
                            })
                        )
                    );
                }
            } else {
                await api.post('/classes', classData);
            }

            // Remove the old teacher's class assignment
            const oldTeacherId = oldClass?.teacherId || '';

            if (oldTeacherId && oldTeacherId !== form.teacherId) {
                await api.patch(`/users/${oldTeacherId}`, {
                    assignedClass: ''
                });
            }

            // Assign the selected teacher to this class
            if (selectedTeacher) {
                await api.patch(`/users/${selectedTeacher.id}`, {
                    assignedClass: className
                });
            }

            resetForm();
            setMessage(
                form.id
                    ? 'Class updated successfully!'
                    : 'Class added successfully!'
            );
            setError('');

            await loadData();
        } catch (err) {
            setError('Cannot save class. Please try again!');
            await loadData();
        }
    };

    // Add a student to the class currently being edited
    const handleAddStudent = async () => {
        if (!form.id) {
            setError('Please select a class to edit first!');
            return;
        }

        const currentClass = classes.find(item => item.id === form.id);

        if (!currentClass) {
            setError('Class not found!');
            return;
        }

        if (form.className.trim() !== currentClass.className) {
            setError('Please save the class name before adding students!');
            return;
        }

        if (!selectedStudentId) {
            setError('Please select a student!');
            return;
        }

        const selectedStudent = students.find(
            student => student.id === selectedStudentId
        );

        if (!selectedStudent) {
            setError('Student not found!');
            return;
        }

        if (selectedStudent.class === currentClass.className) {
            setError('This student is already in this class!');
            return;
        }

        const confirmMove = selectedStudent.class
            ? window.confirm(
                `${selectedStudent.name} is currently in class ${selectedStudent.class}. Move this student to ${currentClass.className}?`
            )
            : true;

        if (!confirmMove) return;

        try {
            await api.patch(`/students/${selectedStudent.id}`, {
                class: currentClass.className
            });

            setSelectedStudentId('');
            setMessage(
                `${selectedStudent.name} has been added to ${currentClass.className}!`
            );
            setError('');

            await loadData();
        } catch (err) {
            setError('Cannot add student to this class!');
        }
    };

    const handleDelete = async (item) => {
        const classStudents = students.filter(
            student => student.class === item.className
        );

        if (classStudents.length > 0) {
            alert('Cannot delete this class because it still has students!');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete class ${item.className}?`
        );

        if (!confirmDelete) return;

        try {
            if (item.teacherId) {
                await api.patch(`/users/${item.teacherId}`, {
                    assignedClass: ''
                });
            }

            await api.delete(`/classes/${item.id}`);

            setMessage('Class deleted successfully!');
            setError('');

            if (form.id === item.id) {
                resetForm();
            }

            await loadData();
        } catch (err) {
            setError('Cannot delete class!');
        }
    };

    const filteredClasses = classes.filter(item =>
        item.className.toLowerCase().includes(search.toLowerCase())
    );

    const getTeacherName = (teacherId) => {
        const teacher = teachers.find(
            item => item.id === teacherId
        );

        return teacher ? teacher.name : 'Not assigned';
    };

    const getStudentCount = (className) => {
        return students.filter(
            student => student.class === className
        ).length;
    };

    const currentClass = classes.find(item => item.id === form.id);

    const currentClassStudents = currentClass
        ? students.filter(student => student.class === currentClass.className)
        : [];

    const availableStudents = currentClass
        ? students.filter(student => student.class !== currentClass.className)
        : [];

    return (
        <div className="classes-page">

            <div className="classes-header">
                <div>
                    <h2>Class Management</h2>
                    <p>Manage classes and assign teachers</p>
                </div>

                <div className="classes-total">
                    Total Classes: <strong>{classes.length}</strong>
                </div>
            </div>

            {message && (
                <div className="class-message success">
                    {message}
                </div>
            )}

            {error && (
                <div className="class-message error">
                    {error}
                </div>
            )}

            <div className="class-form-card">
                <h3>{form.id ? 'Edit Class' : 'Add New Class'}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="class-form-grid">

                        <div className="class-form-group">
                            <label>Class Name</label>
                            <input
                                type="text"
                                name="className"
                                value={form.className}
                                onChange={handleChange}
                                placeholder="Enter class name"
                            />
                        </div>

                        <div className="class-form-group">
                            <label>Assign Teacher</label>
                            <select
                                name="teacherId"
                                value={form.teacherId}
                                onChange={handleChange}
                            >
                                <option value="">-- No Teacher --</option>

                                {teachers.map(teacher => (
                                    <option
                                        key={teacher.id}
                                        value={teacher.id}
                                    >
                                        {teacher.name} ({teacher.username})
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div className="class-form-actions">
                        <button type="submit" className="class-save-button">
                            {form.id ? 'Update Class' : 'Add Class'}
                        </button>

                        {form.id && (
                            <button
                                type="button"
                                className="class-cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {form.id && currentClass && (
                    <div style={{
                        marginTop: '25px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <h3>Manage Students - {currentClass.className}</h3>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            margin: '15px 0'
                        }}>
                            <select
                                value={selectedStudentId}
                                onChange={e => {
                                    setSelectedStudentId(e.target.value);
                                    setError('');
                                }}
                                style={{
                                    minWidth: '250px',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px'
                                }}
                            >
                                <option value="">-- Select Student --</option>

                                {availableStudents.map(student => (
                                    <option
                                        key={student.id}
                                        value={student.id}
                                    >
                                        {student.studentCode} - {student.name}
                                        {student.class
                                            ? ` (Current: ${student.class})`
                                            : ' (No class)'}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={handleAddStudent}
                                disabled={!selectedStudentId}
                                style={{
                                    padding: '10px 18px',
                                    background: selectedStudentId
                                        ? '#2563eb'
                                        : '#9ca3af',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: selectedStudentId
                                        ? 'pointer'
                                        : 'not-allowed'
                                }}
                            >
                                Add Student
                            </button>
                        </div>

                        <h4 style={{ marginTop: '20px' }}>
                            Students in this class ({currentClassStudents.length})
                        </h4>

                        {currentClassStudents.length > 0 ? (
                            <div style={{
                                overflowX: 'auto',
                                marginTop: '10px'
                            }}>
                                <table className="class-table">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Student Code</th>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentClassStudents.map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{index + 1}</td>
                                                <td>{student.studentCode}</td>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{
                                padding: '15px',
                                color: '#6b7280',
                                background: '#f9fafb',
                                borderRadius: '6px'
                            }}>
                                No students in this class yet.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="class-table-card">

                <div className="class-table-header">
                    <h3>Class List</h3>

                    <input
                        type="text"
                        placeholder="Search class..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="class-table-wrapper">
                    <table className="class-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Class Name</th>
                                <th>Teacher</th>
                                <th>Students</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredClasses.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>

                                    <td>
                                        <strong>{item.className}</strong>
                                    </td>

                                    <td>
                                        {getTeacherName(item.teacherId)}
                                    </td>

                                    <td>
                                        {getStudentCount(item.className)}
                                    </td>

                                    <td>
                                        <div className="class-actions">
                                            <button
                                                className="class-edit-button"
                                                onClick={() => handleEdit(item)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="class-delete-button"
                                                onClick={() => handleDelete(item)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredClasses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="class-empty">
                                        No classes found
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

export default Classes;