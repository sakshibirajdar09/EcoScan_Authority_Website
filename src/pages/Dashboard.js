import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards'; 
import { motion } from 'framer-motion'; 
import { 
    AlertTriangle, 
    MapPin, 
    ArrowRight, 
    BarChart2, 
    PieChart, 
    Trash2, 
    FileText 
} from 'lucide-react'; // Vector Icons

// --- Chart Imports ---
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement, 
    PointElement, 
    LineElement 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// --- SAMPLE DATA (PRESERVED) ---
const ATTENDANCE_RECORDS = [
    { date: '2025-09-16', time: '11:17 AM', status: 'Present', userId: 'SZYVJhcmhMgcWmAAZGEFy5YSgMo1' },
    { date: '2025-09-09', time: '03:19 pm', status: 'Present', userId: 'ly5rDbwHz1P3dIxzZAAskxvGTg32' },
    { date: '2025-09-06', time: '11:11 AM', status: 'Present', userId: 'dHpUBRTlHYSdouOATJW5cUn0Pcy1' },
    { date: '2025-09-04', time: '05:39 AM', status: 'Present', userId: 'ly5rDbwHz1P3dIxzZAAskxvGTg32' },
    { date: '2025-09-02', time: '10:55 am', status: 'Absent', userId: 'dHpUBRTlHYSdouOATJW5cUn0Pcy1' },
    { date: '2025-08-31', time: '01:26 PM', status: 'Present', userId: 'tD8UUeFDivWJDM6r8jKsPA15OPU2' },
    { date: '2025-08-14', time: '09:59 AM', status: 'Present', userId: 'egjLAQIuj2WvL0QYgsoPVsHD9Yf2' },
    { date: '2025-06-25', time: '00:56:24', status: 'Present', userId: 'pZIT5ojcTwRvbMByJkDDVHRSoQz1' },
    { date: '2025-06-10', time: '01:45:08', status: 'Present', userId: '7kMPkpcOCwQZloPdPUiz8KBHs5g1' },
    { date: '2025-06-03', time: '02:50 PM', status: 'Present', userId: 'o1MZIIJBmCSugoktowqr7CKX3ym2' }
];

const MOCK_DUMP_STATUS = { pending: 3, resolved: 15 };
const MOCK_REQUEST_STATUS = { open: 5, completed: 30 };

// --- DATA PREPARATION (PRESERVED) ---
const prepareChartData = (records) => {
    const statusCounts = records.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleString('default', { month: 'short' });
        acc[month] = acc[month] || { Present: 0, Absent: 0 };
        acc[month][record.status] = (acc[month][record.status] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(statusCounts).sort();
    
    const monthlyData = {
        labels: labels,
        datasets: [
            {
                label: 'Present',
                data: labels.map(label => statusCounts[label].Present || 0),
                backgroundColor: '#6fd943', // Fresh Eco Green
                hoverBackgroundColor: '#5cb837',
                borderRadius: 6,
                barThickness: 30,
            },
            {
                label: 'Absent',
                data: labels.map(label => statusCounts[label].Absent || 0),
                backgroundColor: '#ff6b6b', // Soft Warning Red
                hoverBackgroundColor: '#fa5252',
                borderRadius: 6,
                barThickness: 30,
            },
        ],
    };

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;

    const overallData = {
        labels: ['Present', 'Absent'],
        datasets: [
            {
                data: [presentCount, absentCount],
                backgroundColor: ['#6fd943', '#ff6b6b'],
                hoverBackgroundColor: ['#5cb837', '#fa5252'],
                borderWidth: 0,
                cutout: '75%', // Thinner ring for modern look
            },
        ],
    };

    const totalDays = records.length;
    const presentPercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

    return { monthlyData, overallData, presentPercentage };
};

const { monthlyData, overallData, presentPercentage } = prepareChartData(ATTENDANCE_RECORDS);

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const Dashboard = () => {
    const navigate = useNavigate();

    const handleChartClick = (element) => {
        if (element.length > 0) {
            const label = monthlyData.labels[element[0].index];
            alert(`Viewing attendance details for: ${label}`);
            navigate('/attendance'); 
        }
    };
    
    const handleViewDumps = () => navigate('/dumps');
    const handleViewRequests = () => navigate('/garbage-requests');

    // Stylish Chart Options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
            title: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                grid: { color: '#f3f4f6', borderDash: [5, 5] },
                ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#9ca3af' },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, family: "'Inter', sans-serif" }, color: '#6b7280' },
                border: { display: false }
            }
        },
        onClick: (event, element) => handleChartClick(element),
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
            <Sidebar />
            
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="d-flex justify-content-between align-items-center mb-4"
                >
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Authority Dashboard</h2>
                        <p className="text-muted mb-0">Welcome back, Admin! Here's what's happening today.</p>
                    </div>
                    <div className="text-end">
                        <span className="badge bg-white text-secondary shadow-sm p-2 fw-normal">
                            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* 1. Stats Cards (Imported Component) */}
                    <motion.div variants={itemVariants} className="mb-5">
                        <DashboardCards />
                    </motion.div>

                    <div className="row g-4">
                        {/* 2. Attendance Chart */}
                        <div className="col-lg-8">
                            <motion.div variants={itemVariants} className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                            <BarChart2 size={20} className="text-primary"/> Monthly Attendance
                                        </h5>
                                        <small className="text-muted">Performance over last 6 months</small>
                                    </div>
                                    <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => navigate('/attendance')}>Details</button>
                                </div>
                                <div className="card-body px-4 pb-4" style={{ height: '320px' }}>
                                    <Bar data={monthlyData} options={barOptions} />
                                </div>
                            </motion.div>
                        </div>

                        {/* 3. Overall Stats (Doughnut) */}
                        <div className="col-lg-4">
                            <motion.div variants={itemVariants} className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 px-4">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <PieChart size={20} className="text-primary"/> Presence Rate
                                    </h5>
                                </div>
                                <div className="card-body d-flex flex-column align-items-center justify-content-center position-relative">
                                    <div style={{ width: '220px', height: '220px' }}>
                                        <Doughnut 
                                            data={overallData} 
                                            options={{ 
                                                responsive: true, 
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } } 
                                            }} 
                                        />
                                    </div>
                                    {/* Center Text */}
                                    <div className="position-absolute text-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -40%)' }}>
                                        <h2 className="fw-bold mb-0 text-dark">{presentPercentage}%</h2>
                                        <small className="text-muted">Present</small>
                                    </div>
                                    
                                    <div className="mt-4 d-flex gap-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#6fd943'}}></span>
                                            <span className="text-muted small">Present</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: '#ff6b6b'}}></span>
                                            <span className="text-muted small">Absent</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* 4. Action Required Section (Redesigned) */}
                    <motion.div variants={itemVariants} className="row mt-4 g-4">
                        <div className="col-12">
                            <h5 className="text-secondary mb-3 fw-bold px-1">Action Required</h5>
                        </div>
                        
                        {/* Illegal Dumps Alert Card */}
                        <div className="col-md-6">
                            <div 
                                className="card border-0 shadow-sm p-3 h-100 position-relative overflow-hidden" 
                                style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}
                            >
                                <div className="d-flex align-items-start justify-content-between position-relative" style={{ zIndex: 1 }}>
                                    <div className="d-flex gap-3">
                                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                            <Trash2 className="text-danger" size={24} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1">{MOCK_DUMP_STATUS.pending} Illegal Dumps</h5>
                                            <p className="text-muted small mb-3">Reported dumps pending verification.</p>
                                            <button 
                                                onClick={handleViewDumps}
                                                className="btn btn-sm btn-danger rounded-pill px-4 fw-medium shadow-sm"
                                            >
                                                Review Now <ArrowRight size={14} className="ms-1"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pickup Requests Alert Card */}
                        <div className="col-md-6">
                            <div 
                                className="card border-0 shadow-sm p-3 h-100 position-relative overflow-hidden" 
                                style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #fff9db 0%, #fff 100%)' }}
                            >
                                <div className="d-flex align-items-start justify-content-between position-relative" style={{ zIndex: 1 }}>
                                    <div className="d-flex gap-3">
                                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                            <FileText className="text-warning" size={24} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1">{MOCK_REQUEST_STATUS.open} Pickup Requests</h5>
                                            <p className="text-muted small mb-3">User requests waiting for assignment.</p>
                                            <button 
                                                onClick={handleViewRequests}
                                                className="btn btn-sm btn-warning text-dark rounded-pill px-4 fw-medium shadow-sm"
                                            >
                                                Assign Drivers <ArrowRight size={14} className="ms-1"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 5. Hotspot Map Placeholder */}
                    <motion.div variants={itemVariants} className="card border-0 shadow-sm mt-4 overflow-hidden" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                             <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <MapPin size={20} className="text-primary"/> Hotspot Map
                            </h5>
                             <span className="badge bg-light text-dark">Live Updates</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="bg-light d-flex flex-column align-items-center justify-content-center" style={{ height: '300px', backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                <div className="bg-white p-4 rounded-circle shadow-sm mb-3 animate-pulse">
                                    <AlertTriangle size={40} className="text-warning" />
                                </div>
                                <p className="fw-medium text-muted">Map Integration Coming Soon</p>
                                <small className="text-muted">Visualizing reported dumps in your wards</small>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;