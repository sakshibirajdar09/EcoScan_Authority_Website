// src/pages/DumpsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Modal, Button, Badge } from 'react-bootstrap';

// --- REACT-LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure this CSS is imported somewhere (e.g., index.js)
import L from 'leaflet';

// Fix for default marker icon issue with Webpack/CRA (Crucial for Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icon for Pending (Red) and Resolved (Green) Dumps
const redMarker = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const greenMarker = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
// ------------------------------

// Component to handle map rendering and marker placement
const MapDisplay = ({ reports, onMarkerClick }) => {
    // Default center if no reports have coordinates (e.g., center of India)
    const defaultCenter = [20.5937, 78.9629]; 
    
    // Calculate the map center dynamically based on existing reports
    const center = useMemo(() => {
        const validReports = reports.filter(r => r.latitude && r.longitude);
        if (validReports.length === 0) return defaultCenter;

        const avgLat = validReports.reduce((sum, r) => sum + r.latitude, 0) / validReports.length;
        const avgLng = validReports.reduce((sum, r) => sum + r.longitude, 0) / validReports.length;
        return [avgLat, avgLng];
    }, [reports]);

    return (
        <MapContainer 
            center={center} 
            zoom={reports.length > 0 ? 10 : 5} // Zoom in if reports exist
            style={{ height: '50vh', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map(report => (
                // Only render if coordinates are present
                report.latitude && report.longitude && (
                    <Marker 
                        key={report.id} 
                        position={[report.latitude, report.longitude]}
                        icon={report.status === 'Pending' ? redMarker : greenMarker}
                        eventHandlers={{ click: () => onMarkerClick(report) }}
                    >
                        <Popup>
                            <strong>Status:</strong> {report.status}<br/>
                            <strong>Location:</strong> {report.locationDescription}<br/>
                            <Button variant="link" size="sm" onClick={() => onMarkerClick(report)}>
                                View Details
                            </Button>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
};
// ------------------------------

const DumpsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data, including checks for nested location data
    const fetchDumps = async () => {
        try {
            setLoading(true);
            setError(null);
            const dumpsQuery = query(collection(db, 'alerts'), orderBy('date', 'desc'));
            const snapshot = await getDocs(dumpsQuery);

            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    ...docData,
                    // Assuming location is stored as a GeoPoint object or an object {latitude: N, longitude: N}
                    latitude: docData.location ? docData.location.latitude : null, 
                    longitude: docData.location ? docData.location.longitude : null,
                    date: docData.date ? docData.date.toDate().toLocaleDateString() : 'N/A',
                    status: docData.status || 'Pending' 
                };
            });
            setReports(data);
        } catch (err) {
            console.error("Firebase Error: ", err);
            setError("Failed to load dump reports. Please check Firestore rules and collection name ('alerts').");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDumps();
    }, []);

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReport(null);
    };

    const handleStatusChange = async (reportId, newStatus) => {
        const reportRef = doc(db, 'alerts', reportId);
        try {
            await updateDoc(reportRef, { status: newStatus });
            // Optimistically update the local state
            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        } catch(err) {
            console.error("Error updating status: ", err);
            alert("Failed to update status. Please try again.");
        } finally {
            handleCloseModal();
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">📍 Illegal Dump Reports Map & List</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                {/* --- MAP INTEGRATION SECTION (Interactive Visual) --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Live Dump Hotspots</h5>
                        <small>Red markers = Pending, Green markers = Resolved.</small>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div style={{ height: '50vh' }} className="d-flex align-items-center justify-content-center">
                                <p className="text-center">Loading map data...</p>
                            </div>
                        ) : error ? (
                             <div style={{ height: '50vh' }} className="d-flex align-items-center justify-content-center">
                                <p className="text-center text-danger">{error}</p>
                            </div>
                        ) : (
                            <MapDisplay reports={reports} onMarkerClick={handleViewDetails} />
                        )}
                    </div>
                </div>
                {/* -------------------------------------------------- */}
                
                <h2>Report Summary Table</h2>
                <div className="card shadow-sm">
                    <div className="card-body">
                        {!loading && !error && (
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Location Description</th>
                                        <th>Reported On</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length > 0 ? (
                                        reports.map(report => (
                                            <tr key={report.id}>
                                                <td>{report.locationDescription || 'No description'}</td>
                                                <td>{report.date}</td>
                                                <td>
                                                    <Badge pill bg={report.status === 'Pending' ? 'warning' : 'success'}>
                                                        {report.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleViewDetails(report)}>
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted">No dump reports found in the database.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Details Modal (Updated) */}
                {selectedReport && (
                    <Modal show={showModal} onHide={handleCloseModal} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Dump Report Details - <Badge bg={selectedReport.status === 'Pending' ? 'warning' : 'success'}>{selectedReport.status}</Badge></Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="lead"><strong>Location:</strong> {selectedReport.locationDescription}</p>
                            <p><strong>Reported By:</strong> {selectedReport.reportedBy || 'End User'}</p>
                            <p><strong>Date:</strong> {selectedReport.date}</p>
                            
                            <hr />

                            {/* Image Section */}
                            <div className="row text-center mb-4">
                                <div className="col-md-6">
                                    <h6 className="text-primary">Before Cleanup (Report Proof)</h6>
                                    {selectedReport.beforeImage ? (
                                        <img src={selectedReport.beforeImage} alt="Before" className="img-fluid rounded border p-1" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                                    ) : (
                                         <div className="border rounded bg-light p-5" style={{ height: '250px' }}>
                                            <p className="text-muted mt-5">No 'Before' Image</p>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-success">After Cleanup (Collector Proof)</h6>
                                    {selectedReport.afterImage ? (
                                        <img src={selectedReport.afterImage} alt="After" className="img-fluid rounded border p-1" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="border rounded bg-light p-5" style={{ height: '250px' }}>
                                            <p className="text-muted mt-5">Collector Proof Image Not Yet Uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location on Map Placeholder (Now shows coordinates if available) */}
                            <div className="mt-3">
                                <h6>Location Coordinates</h6>
                                {selectedReport.latitude && selectedReport.longitude ? (
                                    <div className="alert alert-info text-center">
                                        Map Coordinates: **Lat {selectedReport.latitude.toFixed(4)}, Lng {selectedReport.longitude.toFixed(4)}**
                                        <p className="small mb-0 mt-2 text-muted">A dedicated map view for this specific report can be implemented here.</p>
                                    </div>
                                ) : (
                                    <div className="alert alert-danger text-center">
                                        Location coordinates are **missing** for this report.
                                    </div>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                            {selectedReport.status === 'Pending' && (
                                <Button variant="success" onClick={() => handleStatusChange(selectedReport.id, 'Resolved')}>
                                    Mark as Resolved
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>
                )}
            </main>
        </div>
    );
};

export default DumpsPage;