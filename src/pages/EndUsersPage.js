import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THIS
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar"; // 2. IMPORT SIDEBAR

const EndUsersPage = () => {
    const navigate = useNavigate(); // 3. INITIALIZE THIS
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, "users"));
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "EndUsers");
        XLSX.writeFile(wb, "EndUsers.xlsx");
    };

    const filteredUsers = filter
        ? users.filter((u) =>
            u.area?.toLowerCase().includes(filter.toLowerCase())
        )
        : users;

    return (
        // 4. ADD THE MAIN LAYOUT WRAPPER
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                
                {/* 5. ADD THE HEADER WITH TITLE AND BACK BUTTON */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">End User Management</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Registered Users</h5>
                         <div className="d-flex" style={{ minWidth: '400px' }}>
                            <input
                                type="text"
                                placeholder="Filter by area..."
                                className="form-control me-2"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <button onClick={handleExport} className="btn btn-success text-nowrap">
                                Export Excel
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <p className="text-center">Loading users...</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Area</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name || "-"}</td>
                                                    <td>{user.email || "-"}</td>
                                                    <td>{user.phone || "-"}</td>
                                                    <td>{user.area || "-"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No users found.</td>
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

export default EndUsersPage;