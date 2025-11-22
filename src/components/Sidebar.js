import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Users, 
    Truck, 
    ClipboardCheck, 
    Trash2, 
    Camera, 
    BarChart2, 
    MessageSquare, 
    Settings, 
    LogOut,
    MapPin
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    };

    // Animation Variants
    const sidebarVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: { 
            x: 0, 
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    const menuItems = [
        { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/end-users", name: "End Users", icon: <Users size={20} /> },
        { path: "/collectors", name: "Collectors", icon: <Truck size={20} /> },
        { path: "/attendance", name: "Attendance", icon: <ClipboardCheck size={20} /> },
        { path: "/dumps", name: "Dumps", icon: <Trash2 size={20} /> },
        { path: "/image-verification", name: "Verification", icon: <Camera size={20} /> },
        { path: "/analytics", name: "Analytics", icon: <BarChart2 size={20} /> },
        { path: "/feedback", name: "Feedback", icon: <MessageSquare size={20} /> },
        { path: "/settings", name: "Settings", icon: <Settings size={20} /> },
        { path: "/garbage-requests", name: "Pickup Requests", icon: <MapPin size={20} /> },
    ];

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
            className="d-flex flex-column vh-100 flex-shrink-0 p-3 text-white" 
            style={{ 
                width: '280px', 
                position: 'fixed',
                background: 'linear-gradient(180deg, #1a2a36 0%, #2d4a3e 100%)', // Dark Eco Gradient
                boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
                zIndex: 1000
            }}
        >
            <a href="/dashboard" className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none px-2">
                <span className="fs-4 fw-bold">🚛 EcoScan <span className="text-success">Auth</span></span>
            </a>
            
            <hr className="text-white-50" />
            
            <ul className="nav nav-pills flex-column mb-auto gap-2">
                {menuItems.map((item) => (
                    <motion.li key={item.path} variants={itemVariants} className="nav-item">
                        <NavLink 
                            to={item.path} 
                            className={({ isActive }) => 
                                `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-white-50'}`
                            }
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: isActive ? '#fff' : '#adb5bd',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                transition: 'all 0.3s ease'
                            })}
                        >
                            {/* Icon Wrapper for hover animation */}
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                {item.icon}
                            </motion.div>
                            <span className="fw-medium">{item.name}</span>
                        </NavLink>
                    </motion.li>
                ))}
            </ul>
            
            <hr className="text-white-50" />
            
            <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.95 }}
            >
                <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    style={{ borderRadius: '12px' }}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default Sidebar;