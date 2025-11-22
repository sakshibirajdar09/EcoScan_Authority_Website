import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THIS
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";

const CollectorsPage = () => {
    const navigate = useNavigate(); // 2. INITIALIZE THIS
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectors = async () => {
            setLoading(true);
            const snapshot = await getDocs(collection(db, "collectors"));
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCollectors(data);
            setLoading(false);
        };
        fetchCollectors();
    }, []);

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                
                {/* 3. THIS SECTION CONTAINS THE TITLE AND THE NEW BACK BUTTON */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Collector Management</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        {loading ? (
                            <p className="text-center">Loading collectors...</p>
                        ) : (
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Assigned Area</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collectors.length > 0 ? (
                                        collectors.map((col) => (
                                            <tr key={col.id}>
                                                <td>{col.fullName || "-"}</td>
                                                <td>{col.email || "-"}</td>
                                                <td>{col.contact || "-"}</td>
                                                <td>{col.area || "-"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">No collectors found in the database.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CollectorsPage;