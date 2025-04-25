import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyCareer.scss";

const MyCareer = () => {
  const [userData, setUserData] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        setUserData(user);

        const resQuiz = await fetch(`http://localhost:3000/api/quiz-result/user-populated/${user._id}`);
        const quizData = await resQuiz.json();
        setQuizHistory(Array.isArray(quizData) ? quizData : []);

        const resExams = await fetch(`http://localhost:3000/api/exam-ai/results/${user._id}`);
        const examData = await resExams.json();
        setExamHistory(Array.isArray(examData) ? examData : []);

        const resCert = await fetch(`http://localhost:3000/users/certificates/${user._id}`);
        const certData = await resCert.json();
        setCertificates(Array.isArray(certData) ? certData : []);

        const resAppointments = await fetch(`http://localhost:3000/api/appointments/user/${user._id}`);
        const appData = await resAppointments.json();
        setAppointments(Array.isArray(appData) ? appData : []);
      } catch (err) {
        console.error("❌ Erreur chargement :", err);
      }
    };

    fetchData();
  }, []);

  const getAverageScore = () => {
    const scores = quizHistory.map(q => q.score);
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      const res = await axios.patch(`http://localhost:3000/api/appointments/update-status/${appointmentId}`, { status });
      const updated = res.data.appointment;

      setAppointments(prev =>
        prev.map(appt => (appt._id === appointmentId ? updated : appt))
      );
    } catch (err) {
      console.error("❌ Erreur changement statut :", err);
    }
  };

  return (
    <div className="my-career">
      <h1>🎯 My Career</h1>

      <section className="section">
        <h2>✅ Global Progress</h2>
        <div className="stats-grid">
          <div className="stat-box"><h3>Quiz Validated</h3><p>{quizHistory.length}</p></div>
          <div className="stat-box"><h3>Exams Passed</h3><p>{examHistory.filter(e => e.score >= 3).length}</p></div>
          <div className="stat-box"><h3>Certificates</h3><p>{certificates.length}</p></div>
          <div className="stat-box"><h3>Average Score</h3><p>{getAverageScore()}</p></div>
        </div>
      </section>

      <section className="section">
        <h2>📚 Quiz History</h2>
        {quizHistory.length === 0 ? (
          <p>No quizzes completed yet.</p>
        ) : (
          <ul className="history-list">
            {quizHistory.map((quiz, index) => (
              <li key={index}>
                <strong>Course:</strong> {quiz.courseId?.title || <span style={{ color: "red" }}>⚠️ Course Deleted</span>} —
                <strong> Score:</strong> {quiz.score}/{quiz.total}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>🧪 Exams</h2>
        {examHistory.length === 0 ? (
          <p>No exams taken yet.</p>
        ) : (
          <ul className="history-list">
            {examHistory.map((exam, index) => (
              <li key={index}>
                {exam.category} — {exam.score}/5 —
                {exam.certificatUrl && (
                  <a href={exam.certificatUrl} target="_blank" rel="noreferrer" className="pdf-link">📎 Certificate</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>🎓 Certificates</h2>
        {certificates.length === 0 ? (
          <p>No certificates yet.</p>
        ) : (
          <div className="cert-list">
            {certificates.map((cert, index) => (
              <div key={index} className="cert-item">
                <p>{cert.category} — {new Date(cert.date).toLocaleDateString()}</p>
                <a href={cert.url} target="_blank" rel="noreferrer" className="pdf-link">📎 View PDF</a>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>📅 Exchange Invitations</h2>
        {appointments.length === 0 ? (
          <p>No upcoming skill exchange sessions.</p>
        ) : (
          <ul className="history-list">
            {appointments.map((appt, idx) => (
              <li key={idx}>
                <strong>{appt.fromUser?.name} {appt.fromUser?.surname}</strong> wants to share <strong>{appt.skill}</strong> on <strong>{new Date(appt.date).toLocaleString()}</strong><br />
                
                <strong>Status:</strong> {appt.status.toUpperCase()} <br />
                
                {appt.status === "pending" && userData?._id === appt.toUser?._id && (
                  <>
                    <button onClick={() => handleStatusChange(appt._id, "accepted")} style={{ marginRight: "10px" }}>
                      ✅ Accept
                    </button>
                    <button onClick={() => handleStatusChange(appt._id, "rejected")} style={{ color: "red" }}>
                      ❌ Reject
                    </button>
                  </>
                )}

                {appt.status === "accepted" && (
                  <p>
                    📎 Link: <a href={appt.link} target="_blank" rel="noreferrer">{appt.link}</a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MyCareer;
