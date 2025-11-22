import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [dumpsChartData, setDumpsChartData] = useState(null);
    const [attendanceChartData, setAttendanceChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- 1. Fetch data for Illegal Dumps Hotspots Chart ---
                const alertsSnapshot = await getDocs(collection(db, 'alerts'));
                const dumpCountsByArea = {};
                alertsSnapshot.forEach(doc => {
                    const area = doc.data().area || 'Unknown Area';
                    dumpCountsByArea[area] = (dumpCountsByArea[area] || 0) + 1;
                });

                setDumpsChartData({
                    labels: Object.keys(dumpCountsByArea),
                    datasets: [{
                        label: 'Illegal Dumps Reported by Area',
                        data: Object.values(dumpCountsByArea),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                    }],
                });

                // --- 2. Fetch data for Monthly Attendance Trends Chart ---
                const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
                const attendanceByMonth = {};
                attendanceSnapshot.forEach(doc => {
                    const record = doc.data();
                    if (record.date && record.status) {
                        const date = record.date.toDate();
                        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                        if (!attendanceByMonth[monthYear]) {
                            attendanceByMonth[monthYear] = { present: 0, total: 0 };
                        }
                        attendanceByMonth[monthYear].total += 1;
                        const status = record.status.toLowerCase();
                        if (status === 'present' || status === 'yes') {
                            attendanceByMonth[monthYear].present += 1;
                        }
                    }
                });

                const sortedMonths = Object.keys(attendanceByMonth).sort((a, b) => new Date(a) - new Date(b));
                const attendancePercentages = sortedMonths.map(month => {
                    const { present, total } = attendanceByMonth[month];
                    return total > 0 ? (present / total) * 100 : 0;
                });

                setAttendanceChartData({
                    labels: sortedMonths,
                    datasets: [{
                        label: 'Collector Attendance %',
                        data: attendancePercentages,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        tension: 0.1,
                    }],
                });

            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, []);

    // NOTE: The complex chartOptions object has been removed from here.
    // We will define options directly in the chart components below.

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Data & Analytics</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>
                
                {loading && <p className="text-center">Loading analytics charts...</p>}
                {error && <p className="text-center text-danger">{error}</p>}

                {!loading && !error && (
                    <div className="row">
                        <div className="col-xl-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    {dumpsChartData ? (
                                        <Bar 
                                            // ✅ UPDATED AND SIMPLIFIED OPTIONS
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { position: 'top' },
                                                    title: { display: true, text: 'Illegal Dump Hotspots by Area', font: { size: 18 } },
                                                },
                                                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                                            }} 
                                            data={dumpsChartData} 
                                        />
                                    ) : (
                                        <p>No dump data available to display.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    {attendanceChartData ? (
                                        <Line 
                                            // ✅ UPDATED AND SIMPLIFIED OPTIONS
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { position: 'top' },
                                                    title: { display: true, text: 'Monthly Attendance Rate (%)', font: { size: 18 } },
                                                },
                                                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                                            }} 
                                            data={attendanceChartData} 
                                        />
                                    ) : (
                                        <p>No attendance data available to display.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AnalyticsPage;