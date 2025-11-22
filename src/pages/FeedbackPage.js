import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THIS
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const FeedbackPage = () => {
    const navigate = useNavigate(); // 2. INITIALIZE THIS
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                setLoading(true);
                setError(null);
                const feedbackQuery = query(collection(db, 'feedback'));
                const snapshot = await getDocs(feedbackQuery);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFeedbackList(data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load feedback from the database.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>

                {/* 3. THIS SECTION CONTAINS THE TITLE AND THE NEW BACK BUTTON */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Feedback & Complaints</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>
                
                <div className="card shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">User Submissions (Survey Results)</h5>
                    </div>
                    <div className="card-body">
                        {loading && <p className="text-center">Loading feedback...</p>}
                        {error && <p className="text-center text-danger">{error}</p>}
                        {!loading && !error && (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Feedback ID</th>
                                            <th>Q1</th>
                                            <th>Q2</th>
                                            <th>Q3</th>
                                            <th>Q4</th>
                                            <th>Q5</th>
                                            <th>Total Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbackList.length > 0 ? (
                                            feedbackList.map(item => (
                                                <tr key={item.id}>
                                                    <td><code>{item.id.substring(0, 8)}...</code></td>
                                                    <td>{item.question1}</td>
                                                    <td>{item.question2}</td>
                                                    <td>{item.question3}</td>
                                                    <td>{item.question4}</td>
                                                    <td>{item.question5}</td>
                                                    <td>
                                                        <span className="badge bg-primary fs-6">{item.totalRating}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No feedback has been submitted yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FeedbackPage;