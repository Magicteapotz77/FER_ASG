import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Grades.css';

function Grades() {
    const currentUser = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    const isAdmin = currentUser.role === 'Admin';
    const isTeacher = currentUser.role === 'Teacher';
    const isUser = currentUser.role === 'User';

    const assignedClass = currentUser.assignedClass || '';

    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [form, setForm] = useState({
        studentId: '',
        subjectId: '',
        score: ''
    });

    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');

    // Load data
    const loadData = async () => {
        try {
            const [gradeRes, studentRes, subjectRes] = await Promise.all([
                api.get('/grades'),
                api.get('/students'),
                api.get('/subjects')
            ]);

            let studentData = studentRes.data;
            let gradeData = gradeRes.data;

            // Teacher chỉ được quản lý sinh viên thuộc lớp của mình
            if (isTeacher) {
                studentData = studentData.filter(
                    student => student.class === assignedClass
                );

                const studentIds = studentData.map(
                    student => String(student.id)
                );

                gradeData = gradeData.filter(
                    grade => studentIds.includes(String(grade.studentId))
                );
            }

            setStudents(studentData);
            setGrades(gradeData);
            setSubjects(subjectRes.data);

        } catch (error) {
            console.log(error);
            alert('Cannot load grades!');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({
            studentId: '',
            subjectId: '',
            score: ''
        });

        setEditId(null);
    };

    // Add or update grade
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin && !isTeacher) {
            alert('You do not have permission!');
            return;
        }

        if (isTeacher && !assignedClass) {
            alert('You have not been assigned to any class!');
            return;
        }

        const selectedStudent = students.find(
            student => String(student.id) === String(form.studentId)
        );

        if (!selectedStudent) {
            alert('Please select a valid student!');
            return;
        }

        // Teacher không được nhập điểm cho sinh viên ngoài lớp
        if (
            isTeacher &&
            selectedStudent.class !== assignedClass
        ) {
            alert('You can only manage grades of your assigned class!');
            return;
        }

        const data = {
            studentId: form.studentId,
            subjectId: form.subjectId,
            score: Number(form.score)
        };

        if (
            form.score === '' ||
            Number.isNaN(data.score) ||
            data.score < 0 ||
            data.score > 10
        ) {
            alert('Score must be between 0 and 10!');
            return;
        }

        try {
            if (editId) {
                const currentGrade = grades.find(
                    grade => String(grade.id) === String(editId)
                );

                if (!currentGrade) {
                    alert('Grade not found!');
                    return;
                }

                await api.patch(`/grades/${editId}`, data);

                alert('Update successfully!');

            } else {
                await api.post('/grades', data);

                alert('Add successfully!');
            }

            resetForm();
            await loadData();

        } catch (error) {
            console.log(error);
            alert('Cannot save grade!');
        }
    };

    // Edit grade
    const handleEdit = (grade) => {
        if (!isAdmin && !isTeacher) {
            return;
        }

        const student = students.find(
            s => String(s.id) === String(grade.studentId)
        );

        if (!student) {
            alert('You cannot edit this grade!');
            return;
        }

        if (
            isTeacher &&
            student.class !== assignedClass
        ) {
            alert('You can only edit grades of your assigned class!');
            return;
        }

        setForm({
            studentId: String(grade.studentId),
            subjectId: String(grade.subjectId),
            score: grade.score
        });

        setEditId(grade.id);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Delete grade
    const handleDelete = async (id) => {
        if (!isAdmin && !isTeacher) {
            return;
        }

        const grade = grades.find(
            item => String(item.id) === String(id)
        );

        if (!grade) return;

        const student = students.find(
            s => String(s.id) === String(grade.studentId)
        );

        if (!student) {
            alert('You cannot delete this grade!');
            return;
        }

        if (
            isTeacher &&
            student.class !== assignedClass
        ) {
            alert('You can only delete grades of your assigned class!');
            return;
        }

        if (
            !window.confirm('Are you sure you want to delete this grade?')
        ) {
            return;
        }

        try {
            await api.delete(`/grades/${id}`);

            alert('Delete successfully!');

            if (String(editId) === String(id)) {
                resetForm();
            }

            await loadData();

        } catch (error) {
            console.log(error);
            alert('Cannot delete grade!');
        }
    };

    const getStudentName = (id) => {
        const student = students.find(
            s => String(s.id) === String(id)
        );

        return student ? student.name : 'Unknown';
    };

    const getStudentCode = (id) => {
        const student = students.find(
            s => String(s.id) === String(id)
        );

        return student ? student.studentCode : 'Unknown';
    };

    const getSubjectName = (id) => {
        const subject = subjects.find(
            s => String(s.id) === String(id)
        );

        return subject ? subject.subjectName : 'Unknown';
    };

    const getSubjectCode = (id) => {
        const subject = subjects.find(
            s => String(s.id) === String(id)
        );

        return subject ? subject.subjectCode : 'Unknown';
    };

    const filteredGrades = grades.filter(g =>
        getStudentName(g.studentId)
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        getStudentCode(g.studentId)
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        getSubjectName(g.subjectId)
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        getSubjectCode(g.subjectId)
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="grades-page">
            <div className="grades-container">

                <div className="grades-header">
                    <div>
                        <h1>Grades Management</h1>

                        <p>
                            {isTeacher
                                ? `Manage grades in class ${assignedClass}`
                                : 'Manage student academic results'}
                        </p>
                    </div>

                    <div className="total-grades">
                        Total Grades: {filteredGrades.length}
                    </div>
                </div>

                {isTeacher && !assignedClass && (
                    <div className="grade-empty">
                        You have not been assigned to any class.
                        Please contact Admin.
                    </div>
                )}

                {/* Admin và Teacher được thêm, sửa điểm */}
                {(isAdmin || isTeacher) && (
                    <div className="grade-form-card">

                        <h3>
                            {editId ? 'Edit Grade' : 'Add New Grade'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="grade-form-grid">

                                <div className="grade-form-group">
                                    <label>Student *</label>

                                    <select
                                        name="studentId"
                                        value={form.studentId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Student
                                        </option>

                                        {students.map(s => (
                                            <option
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {s.studentCode} - {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grade-form-group">
                                    <label>Subject *</label>

                                    <select
                                        name="subjectId"
                                        value={form.subjectId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Subject
                                        </option>

                                        {subjects.map(s => (
                                            <option
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {s.subjectCode} - {s.subjectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grade-form-group">
                                    <label>Score (0 - 10) *</label>

                                    <input
                                        type="number"
                                        name="score"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        placeholder="Enter score"
                                        value={form.score}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>

                            <div className="grade-form-buttons">

                                <button
                                    type="submit"
                                    className="grade-btn-primary"
                                >
                                    {editId ? 'Update Grade' : 'Add Grade'}
                                </button>

                                <button
                                    type="button"
                                    className="grade-btn-cancel"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                            </div>
                        </form>

                    </div>
                )}

                <div className="grade-list-card">

                    <div className="grade-list-header">
                        <div>
                            <h3>Grade List</h3>
                            <p>{filteredGrades.length} records found</p>
                        </div>

                        <input
                            className="grade-search"
                            placeholder="Search student or subject..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grade-table-container">

                        <table className="grades-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student Code</th>
                                    <th>Student Name</th>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Score</th>
                                    <th>Result</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredGrades.map(g => (
                                    <tr key={g.id}>

                                        <td>{g.id}</td>

                                        <td className="grade-code">
                                            {getStudentCode(g.studentId)}
                                        </td>

                                        <td className="grade-student">
                                            {getStudentName(g.studentId)}
                                        </td>

                                        <td className="grade-code">
                                            {getSubjectCode(g.subjectId)}
                                        </td>

                                        <td>
                                            {getSubjectName(g.subjectId)}
                                        </td>

                                        <td className="grade-score">
                                            {Number(g.score).toFixed(1)}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    Number(g.score) >= 5
                                                        ? 'grade-passed'
                                                        : 'grade-failed'
                                                }
                                            >
                                                {Number(g.score) >= 5
                                                    ? 'Passed'
                                                    : 'Failed'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="grade-actions">

                                                {(isAdmin || isTeacher) && (
                                                    <>
                                                        <button
                                                            className="grade-btn-edit"
                                                            onClick={() => handleEdit(g)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="grade-btn-delete"
                                                            onClick={() => handleDelete(g.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                                {!isAdmin && !isTeacher && (
                                                    <span>View only</span>
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                                {filteredGrades.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="grade-empty">
                                            No grades found
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

export default Grades;
