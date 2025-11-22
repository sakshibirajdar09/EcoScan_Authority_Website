
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added
import Sidebar from '../components/Sidebar';
import { db, auth } from '../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const SettingsPage = () => {
    const navigate = useNavigate(); // Added
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [newWard, setNewWard] = useState('');
    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(true);

    // Fetch existing wards from Firestore when the component loads
    useEffect(() => {
        const fetchWards = async () => {
            setLoadingWards(true);
            try {
                const snapshot = await getDocs(collection(db, 'wards'));
                const wardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWards(wardsData);
            } catch (error) {
                console.error("Error fetching wards:", error);
            } finally {
                setLoadingWards(false);
            }
        };
        fetchWards();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'New passwords do not match.' });
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setMessage({ type: 'danger', text: 'No user is currently signed in.' });
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error updating password:", error);
            setMessage({ type: 'danger', text: 'Error updating password. Please check your current password.' });
        }
    };

    // Add a new ward to the 'wards' collection in Firestore
    const handleAddWard = async (e) => {
        e.preventDefault();
        if (newWard.trim() === '') {
            alert("Ward name cannot be empty.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'wards'), {
                name: newWard.trim()
            });
            // Add the new ward to the local state to update the UI instantly
            setWards([...wards, { id: docRef.id, name: newWard.trim() }]);
            setNewWard('');
        } catch (error) {
            console.error("Error adding new ward:", error);
            alert("Failed to add new ward.");
        }
    };
    
    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Profile & Settings</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="row">
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Change Password</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePasswordChange}>
                                    {message.text && (
                                        <div className={`alert alert-${message.type}`}>{message.text}</div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Current Password</label>
                                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-control" required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Update Password</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-4">
                         <div className="card shadow-sm h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Manage Wards/Locations</h5>
                            </div>
                            <div className="card-body">
                                {loadingWards ? <p>Loading wards...</p> : (
                                    <ul className="list-group mb-3">
                                        {wards.map(ward => (
                                            <li key={ward.id} className="list-group-item">{ward.name}</li>
                                        ))}
                                    </ul>
                                )}
                                <form onSubmit={handleAddWard} className="d-flex">
                                    <input type="text" value={newWard} onChange={e => setNewWard(e.target.value)} className="form-control me-2" placeholder="Enter new ward name" required />
                                    <button type="submit" className="btn btn-success">Add</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;