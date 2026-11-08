
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const currentUser = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    const isAdmin = currentUser.role === 'Admin';
    const isTeacher = currentUser.role === 'Teacher';
    const assignedClass = currentUser.assignedClass || '';

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [studentRes, subjectRes, gradeRes] =
                    await Promise.all([
                        api.get('/students'),
                        api.get('/subjects'),
                        api.get('/grades')
                    ]);

                let studentData = studentRes.data;
                let gradeData = gradeRes.data;

                // Teacher chỉ xem dữ liệu lớp được phân công
                if (isTeacher) {
                    studentData = studentData.filter(
                        student => student.class === assignedClass
                    );

                    const studentIds = studentData.map(
                        student => String(student.id)
                    );

                    gradeData = gradeData.filter(
                        grade => studentIds.includes(
                            String(grade.studentId)
                        )
                    );
                }

                setStudents(studentData);
                setSubjects(subjectRes.data);
                setGrades(gradeData);

            } catch (error) {
                console.log(error);
                alert('Cannot load dashboard data!');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Average score
    const averageScore = grades.length > 0
        ? grades.reduce(
            (sum, grade) => sum + Number(grade.score),
            0
        ) / grades.length
        : 0;

    // Passed and failed
    const passed = grades.filter(
        grade => Number(grade.score) >= 5
    ).length;

    const failed = grades.filter(
        grade => Number(grade.score) < 5
    ).length;

    const passedPercent = grades.length > 0
        ? (passed / grades.length) * 100
        : 0;

    const failedPercent = grades.length > 0
        ? (failed / grades.length) * 100
        : 0;

    // Latest 5 students
    const recentStudents = [...students]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>

                        <p>
                            {isTeacher
                                ? `Welcome, ${currentUser.name || 'Teacher'} - Class ${assignedClass}`
                                : `Welcome, ${currentUser.name || 'User'} to Student Management System`
                            }
                        </p>
                    </div>

                    <div className="dashboard-date">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* Navigation */}
                <div className="dashboard-navigation">
                    <Link to="/students">Students</Link>
                    <Link to="/subjects">Subjects</Link>
                    <Link to="/grades">Grades</Link>
                </div>

                {/* Statistics */}
                <div className="dashboard-stats">

                    <div className="stat-card stat-blue">
                        <div className="stat-icon">👨‍🎓</div>

                        <div>
                            <p>Total Students</p>
                            <h2>{students.length}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-purple">
                        <div className="stat-icon">📚</div>

                        <div>
                            <p>Total Subjects</p>
                            <h2>{subjects.length}</h2>
                        </div>
                    </div>

                    <div className="stat-card stat-orange">
                        <div className="stat-icon">📝</div>

                        <div>
                            <p>Total Grades</p>
                            <h2>{grades.length}</h2>
                        </div>
                    </div>

                </div>

                {/* Results */}
                <div className="dashboard-content">

                    <div className="dashboard-card result-card">
                        <h3>Academic Results</h3>

                        <p className="card-description">
                            Overview of student grades
                        </p>

                        <div className="result-summary">

                            <div className="result-item">
                                <span className="result-dot passed-dot"></span>
                                <span>Passed</span>
                                <strong>{passed}</strong>
                            </div>

                            <div className="result-item">
                                <span className="result-dot failed-dot"></span>
                                <span>Failed</span>
                                <strong>{failed}</strong>
                            </div>

                        </div>

                        <div className="result-bar">

                            <div
                                className="passed-bar"
                                style={{
                                    width: `${passedPercent}%`
                                }}
                            ></div>

                            <div
                                className="failed-bar"
                                style={{
                                    width: `${failedPercent}%`
                                }}
                            ></div>

                        </div>

                        <div className="result-percentages">
                            <span>
                                Passed: {passedPercent.toFixed(1)}%
                            </span>

                            <span>
                                Failed: {failedPercent.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="dashboard-card quick-card">
                        <h3>Quick Actions</h3>

                        <p className="card-description">
                            Manage your system
                        </p>

                        <Link to="/students" className="quick-link">
                            <span>👨‍🎓</span>

                            <div>
                                <strong>Manage Students</strong>

                                <small>
                                    {isAdmin
                                        ? 'Manage all student information'
                                        : isTeacher
                                            ? 'View and manage students in your class'
                                            : 'View student information'
                                    }
                                </small>
                            </div>

                            <span className="quick-arrow">›</span>
                        </Link>

                        <Link to="/subjects" className="quick-link">
                            <span>📚</span>

                            <div>
                                <strong>Manage Subjects</strong>

                                <small>
                                    View course information
                                </small>
                            </div>

                            <span className="quick-arrow">›</span>
                        </Link>

                        <Link to="/grades" className="quick-link">
                            <span>📝</span>

                            <div>
                                <strong>Manage Grades</strong>

                                <small>
                                    {isAdmin
                                        ? 'Manage grades of all students'
                                        : isTeacher
                                            ? 'Manage grades in your assigned class'
                                            : 'View student results'
                                    }
                                </small>
                            </div>

                            <span className="quick-arrow">›</span>
                        </Link>

                    </div>

                </div>

                {/* Recent Students */}
                <div className="dashboard-card recent-card">

                    <div className="recent-header">
                        <div>
                            <h3>Recent Students</h3>

                            <p className="card-description">
                                Latest student records
                            </p>
                        </div>

                        <Link to="/students" className="view-all">
                            View All
                        </Link>
                    </div>

                    <div className="recent-table-container">

                        <table className="recent-table">

                            <thead>
                                <tr>
                                    <th>Student Code</th>
                                    <th>Name</th>
                                    <th>Major</th>
                                    <th>Class</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {recentStudents.map(student => (
                                    <tr key={student.id}>

                                        <td className="recent-code">
                                            {student.studentCode}
                                        </td>

                                        <td className="recent-name">
                                            {student.name}
                                        </td>

                                        <td>{student.major}</td>

                                        <td>{student.class}</td>

                                        <td>
                                            <span
                                                className={
                                                    student.status === 'Active'
                                                        ? 'recent-active'
                                                        : 'recent-inactive'
                                                }
                                            >
                                                {student.status}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                                {recentStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="recent-empty"
                                        >
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

export default Dashboard;
