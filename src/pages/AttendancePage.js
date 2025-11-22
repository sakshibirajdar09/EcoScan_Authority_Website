import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const AttendancePage = () => {
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);

                const attendanceQuery = query(
                    collection(db, 'attendance'),
                    orderBy('date', 'desc')
                );
                const snapshot = await getDocs(attendanceQuery);

                const data = snapshot.docs.map(doc => {
                    const docData = doc.data();
                    return {
                        id: doc.id,
                        ...docData,
                        // convert Firestore timestamp to YYYY-MM-DD for filtering
                        date: docData.date ? docData.date.toDate().toISOString().split('T')[0] : 'N/A'
                    };
                });

                setAttendanceRecords(data);
                setFilteredRecords(data);
            } catch (err) {
                console.error("Error fetching attendance records:", err);
                setError("Failed to load attendance records.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    useEffect(() => {
        if (filterDate) {
            setFilteredRecords(
                attendanceRecords.filter(record => record.date === filterDate)
            );
        } else {
            setFilteredRecords(attendanceRecords);
        }
    }, [filterDate, attendanceRecords]);

    const handleExport = () => {
        alert("Exporting data to CSV/Excel...");
        // implement later with 'xlsx' or 'react-csv'
    };

    const isPresent = (status) => {
        if (!status) return false;
        const lowerCaseStatus = status.toLowerCase();
        return lowerCaseStatus === 'present' || lowerCaseStatus === 'yes';
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Attendance Monitoring</h1>
                    <div>
                        <button onClick={handleExport} className="btn btn-success me-2">
                            Export Report
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/dashboard')}
                        >
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Daily Records</h5>
                        <div className="d-flex align-items-center">
                            <label htmlFor="filterDate" className="form-label me-2 mb-0">Filter by Date:</label>
                            <input
                                type="date"
                                id="filterDate"
                                className="form-control"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card-body">
                        {loading && <p className="text-center">Loading records...</p>}
                        {error && <p className="text-center text-danger">{error}</p>}
                        {!loading && !error && (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>User ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.length > 0 ? (
                                            filteredRecords.map(record => (
                                                <tr key={record.id}>
                                                    <td>{record.date || 'N/A'}</td>
                                                    <td>{record.time || 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge ${isPresent(record.status) ? 'bg-success' : 'bg-danger'}`}>
                                                            {isPresent(record.status) ? 'Present' : 'Absent'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <code>{record.uuid || 'N/A'}</code>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    No attendance records found for the selected date.
                                                </td>
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

export default AttendancePage;
