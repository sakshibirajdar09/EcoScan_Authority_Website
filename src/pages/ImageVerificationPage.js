import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const ImageVerificationPage = () => {
    const navigate = useNavigate(); // Added
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This useEffect will run once to fetch the live data
    useEffect(() => {
        const fetchProofs = async () => {
            try {
                setLoading(true);
                setError(null);
                // Query the 'image_proofs' collection, ordered by the most recent date
                const proofsQuery = query(collection(db, 'image_proofs'), orderBy('date', 'desc'));
                const snapshot = await getDocs(proofsQuery);

                // Note: In a real-world, large-scale app, you might fetch collector names separately
                // to avoid storing redundant data. For this project, assuming collectorName is stored is fine.
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setProofs(data);
            } catch (err) {
                console.error("Error fetching image proofs:", err);
                setError("Failed to load image proofs. Please check collection name ('image_proofs').");
            } finally {
                setLoading(false);
            }
        };

        fetchProofs();
    }, []);

    // This function will now update the document in Firestore
    const handleVerification = async (proofId, newStatus) => {
        const proofRef = doc(db, 'image_proofs', proofId);
        try {
            // Update the status in the database
            await updateDoc(proofRef, { status: newStatus });
            // Update the status on the screen immediately
            setProofs(proofs.map(p => p.id === proofId ? { ...p, status: newStatus } : p));
            console.log(`Proof ${proofId} has been ${newStatus}`);
        } catch (err) {
            console.error("Error updating proof status:", err);
            alert("There was an error updating the status.");
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Image Upload Verification</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                {loading && <p className="text-center">Loading proofs for verification...</p>}
                {error && <p className="text-center text-danger">{error}</p>}
                
                {!loading && !error && (
                    <div className="row">
                        {proofs.length > 0 ? (
                            proofs.map(proof => (
                                <div key={proof.id} className="col-lg-6 col-xl-4 mb-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <span><strong>{proof.collectorName || 'Unknown Collector'}</strong> - {proof.area}</span>
                                            <span className={`badge ${
                                                proof.status === 'Pending' ? 'bg-warning' :
                                                proof.status === 'Approved' ? 'bg-success' : 'bg-danger'
                                            }`}>{proof.status}</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-6">
                                                    <p className="text-center small">Before</p>
                                                    <img src={proof.beforeImage} alt="Before" className="img-fluid rounded" />
                                                </div>
                                                <div className="col-6">
                                                    <p className="text-center small">After</p>
                                                    <img src={proof.afterImage} alt="After" className="img-fluid rounded" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Only show buttons if the status is 'Pending' */}
                                        {proof.status === 'Pending' && (
                                            <div className="card-footer bg-white d-flex justify-content-end">
                                                <button className="btn btn-outline-danger btn-sm me-2" onClick={() => handleVerification(proof.id, 'Rejected')}>Reject</button>
                                                <button className="btn btn-success btn-sm" onClick={() => handleVerification(proof.id, 'Approved')}>Approve</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-center text-muted">No pending images for verification.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ImageVerificationPage;