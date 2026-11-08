import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function StudentDetail() {

    const { id } = useParams();

    const [student, setStudent] = useState({});
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {

        api.get(`/students/${id}`)
            .then(res => setStudent(res.data));

        api.get(`/grades?studentId=${id}`)
            .then(res => setGrades(res.data));

        api.get('/subjects')
            .then(res => setSubjects(res.data));

    }, [id]);

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);

        return subject ? subject.subjectName : 'Unknown';
    };

    const average = grades.length > 0
        ? grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length
        : 0;

    return (
        <div style={{ padding: '20px' }}>

            <h2>Student Detail</h2>

            <Link to="/students">Back to Students</Link>

            <hr />

            <h3>Personal Information</h3>

            <p><b>Student Code:</b> {student.studentCode}</p>
            <p><b>Name:</b> {student.name}</p>
            <p><b>Gender:</b> {student.gender}</p>
            <p><b>Date of Birth:</b> {student.dateOfBirth}</p>
            <p><b>Email:</b> {student.email}</p>
            <p><b>Phone:</b> {student.phone}</p>
            <p><b>Major:</b> {student.major}</p>
            <p><b>Class:</b> {student.class}</p>
            <p><b>Status:</b> {student.status}</p>

            <hr />

            <h3>Academic Results</h3>

            <p>
                <b>Average Score:</b> {average.toFixed(2)}
            </p>

            <table border="1" cellPadding="10" width="100%">

                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Subject ID</th>
                        <th>Subject Name</th>
                        <th>Score</th>
                        <th>Result</th>
                    </tr>
                </thead>

                <tbody>

                    {grades.map((g, index) => (

                        <tr key={g.id}>
                            <td>{index + 1}</td>
                            <td>{g.subjectId}</td>
                            <td>{getSubjectName(g.subjectId)}</td>
                            <td>{g.score}</td>
                            <td>
                                {Number(g.score) >= 5 ? 'Passed' : 'Failed'}
                            </td>
                        </tr>

                    ))}

                    {grades.length === 0 && (
                        <tr>
                            <td colSpan="5">No grades found</td>
                        </tr>
                    )}

                </tbody>

            </table>

        </div>
    );
}

export default StudentDetail;