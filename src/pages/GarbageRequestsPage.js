import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { Modal, Button, Form, Card, Table, Alert } from 'react-bootstrap';

// Helper function to format date/time
const formatDateTime = (date, time) => {
    // Basic formatting assuming date is YYYY-MM-DD and time is HH:MM (or similar)
    return `${date || 'N/A'} @ ${time || 'N/A'}`;
};

const GarbageRequestsPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Pending'); // New state for filtering

    // State for the assignment modal
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [allAreas, setAllAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [availableCollectors, setAvailableCollectors] = useState([]);
    const [selectedCollectorId, setSelectedCollectorId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false); // State for assignment loading

    // Fetch requests, collectors, and areas when the page loads
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                // Ordering by pickupDate is good, but we filter in memory for simplicity with onSnapshot later
                const requestsQuery = query(collection(db, 'garbage_requests'), orderBy('pickupDate', 'desc'));
                const snapshot = await getDocs(requestsQuery);
                const data = snapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    // Ensure status is always set, defaulting to 'Pending' if missing
                    status: 'Pending', 
                    ...doc.data() 
                }));
                setRequests(data);
            } catch (err) {
                setError("Failed to load garbage requests. Check console for details.");
                console.error("Firestore fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Effect to fetch collectors based on selected area
    useEffect(() => {
        if (selectedArea) {
            const fetchCollectorsForArea = async () => {
                try {
                    const collectorsQuery = query(collection(db, 'collectors'), where('area', '==', selectedArea));
                    const snapshot = await getDocs(collectorsQuery);
                    const collectorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setAvailableCollectors(collectorsData);
                } catch (err) {
                    console.error("Failed to fetch collectors for area:", err);
                    alert("Could not load collectors for the selected area.");
                }
            };
            fetchCollectorsForArea();
        } else {
            setAvailableCollectors([]); // Clear collectors if no area is selected
        }
    }, [selectedArea]);

    const handleOpenAssignModal = async (request) => {
        setSelectedRequest(request);
        try {
            // Fetch all unique areas from the collectors collection
            const collectorsSnapshot = await getDocs(collection(db, 'collectors'));
            const areas = new Set(collectorsSnapshot.docs.map(doc => doc.data().area).filter(area => area)); // Filter out null/undefined areas
            setAllAreas(Array.from(areas));
            
            // Set the area if the request already has one (e.g., re-assignment)
            const initialArea = request.area || '';
            setSelectedArea(initialArea);
            
            // If an area is preset, pre-fetch collectors for that area immediately
            if (initialArea) {
                const collectorsQuery = query(collection(db, 'collectors'), where('area', '==', initialArea));
                const snapshot = await getDocs(collectorsQuery);
                const collectorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAvailableCollectors(collectorsData);
            }

            setShowModal(true);
        } catch (err) {
            alert("Failed to fetch available areas.");
            console.error(err);
        }
    };
    
    const handleConfirmAssignment = async () => {
        if (!selectedCollectorId) {
            alert("Please select a collector.");
            return;
        }

        setIsAssigning(true);
        const collectorInfo = availableCollectors.find(c => c.id === selectedCollectorId);
        const requestRef = doc(db, 'garbage_requests', selectedRequest.id);

        try {
            // Update Firestore document
            await updateDoc(requestRef, {
                status: 'Assigned',
                assignedCollectorId: selectedCollectorId,
                assignedCollectorName: collectorInfo.fullName || 'Unspecified Collector',
                area: selectedArea 
            });

            // Update local state immediately
            setRequests(requests.map(r => 
                r.id === selectedRequest.id 
                ? { 
                    ...r, 
                    status: 'Assigned', 
                    assignedCollectorName: collectorInfo.fullName, 
                    area: selectedArea 
                  } 
                : r
            ));
            handleCloseModal();
        } catch (err) {
            alert("Failed to assign the task. Please try again.");
            console.error("Assignment update error:", err);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
        setSelectedArea('');
        setAvailableCollectors([]);
        setSelectedCollectorId('');
    };
    
    // --- Data Filtering Logic ---
    const filteredRequests = useMemo(() => {
        if (filterStatus === 'All') {
            return requests;
        }
        // Use lowercase comparison for robustness
        return requests.filter(request => request.status?.toLowerCase() === filterStatus.toLowerCase());
    }, [requests, filterStatus]);
    
    // Helper to determine badge style
    const getStatusBadge = (status) => {
        const lowerStatus = status?.toLowerCase() || 'pending';
        switch (lowerStatus) {
            case 'pending':
                return { className: 'bg-warning text-dark', label: 'PENDING ACTION' };
            case 'assigned':
                return { className: 'bg-info text-white', label: 'ASSIGNED' };
            case 'completed':
                return { className: 'bg-success text-white', label: 'COMPLETED' };
            default:
                return { className: 'bg-secondary text-white', label: 'UNKNOWN' };
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <main className="container-fluid p-4" style={{ marginLeft: '280px', flexGrow: 1 }}>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0 text-primary">🧹 Garbage Pickup Requests</h1>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                        &larr; Back to Dashboard
                    </button>
                </div>

                <Card className="shadow-lg mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">Request Queue ({filteredRequests.length} results)</h5>
                            
                            {/* Filter Buttons */}
                            <div className="btn-group">
                                {['Pending', 'Assigned', 'Completed', 'All'].map(status => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? 'primary' : 'outline-primary'}
                                        onClick={() => setFilterStatus(status)}
                                        className="rounded-pill mx-1"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {loading && <p className="text-center text-primary py-5">Loading operational data...</p>}
                        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                        {!loading && !error && (
                            <div className="table-responsive">
                                <Table striped bordered hover className="requests-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="text-center">#</th>
                                            <th>Requester Name</th>
                                            <th>Location / Address</th>
                                            <th className="text-center">Pickup Date & Time</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted py-3">
                                                    No requests found for the '{filterStatus}' filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRequests.map((request, index) => {
                                                const badge = getStatusBadge(request.status);
                                                return (
                                                    <tr key={request.id} className={request.status?.toLowerCase() === 'pending' ? 'table-warning' : ''}>
                                                        <td className="text-center align-middle">{index + 1}</td>
                                                        <td className="align-middle fw-bold">{request.name || 'N/A'}</td>
                                                        <td className="align-middle">
                                                            <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
                                                            {request.address || 'Address Not Provided'}
                                                            {request.area && <span className="ms-3 badge bg-secondary">{request.area}</span>}
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <span className="text-monospace">
                                                                {formatDateTime(request.pickupDate, request.pickupTime)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <span className={`badge ${badge.className} p-2`}>
                                                                {badge.label}
                                                                {request.status?.toLowerCase() === 'assigned' && 
                                                                    ` to ${request.assignedCollectorName || 'Unassigned'}`
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            {request.status?.toLowerCase() === 'pending' ? (
                                                                <Button 
                                                                    variant="success" 
                                                                    size="sm" 
                                                                    onClick={() => handleOpenAssignModal(request)}
                                                                >
                                                                    <i className="fas fa-user-plus me-1"></i> Assign
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    variant="outline-secondary" 
                                                                    size="sm"
                                                                    onClick={() => handleOpenAssignModal(request)} // Allow re-assignment
                                                                >
                                                                    View / Re-assign
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* --- Two-Step Assignment Modal --- */}
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>Assign Task: Pickup Request</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="alert alert-info py-2">
                            <h6 className="mb-0">Request ID: {selectedRequest?.id.substring(0, 8)}...</h6>
                            <p className="mb-0">
                                <i className="fas fa-user me-2"></i><strong>From:</strong> {selectedRequest?.name || 'N/A'}
                            </p>
                            <p className="mb-0">
                                <i className="fas fa-map-marked-alt me-2"></i><strong>Address:</strong> {selectedRequest?.address || 'N/A'}
                            </p>
                        </div>

                        <hr/>
                        
                        {/* Step 1: Select Area */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Step 1: Locate Service Area</Form.Label>
                            <Form.Select 
                                value={selectedArea} 
                                onChange={(e) => {
                                    setSelectedArea(e.target.value);
                                    setSelectedCollectorId(''); // Reset collector when area changes
                                }}
                            >
                                <option value="">-- Select or Confirm Area --</option>
                                {allAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        {/* Step 2: Select Collector */}
                        <Form.Group>
                            <Form.Label className="fw-bold">Step 2: Assign Collector</Form.Label>
                            {selectedArea ? (
                                availableCollectors.length > 0 ? (
                                    <Form.Select 
                                        value={selectedCollectorId} 
                                        onChange={(e) => setSelectedCollectorId(e.target.value)}
                                    >
                                        <option value="">-- Choose an Available Collector --</option>
                                        {availableCollectors.map(collector => (
                                            <option key={collector.id} value={collector.id}>
                                                {collector.fullName || collector.id} 
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Alert variant="warning" className="p-2">No collectors found for area: {selectedArea}.</Alert>
                                )
                            ) : (
                                <Alert variant="secondary" className="p-2">Please select a service area first to see available collectors.</Alert>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button 
                            variant="primary" 
                            onClick={handleConfirmAssignment} 
                            disabled={!selectedCollectorId || isAssigning}
                        >
                            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                        </Button>
                    </Modal.Footer>
                </Modal>
                
            </main>
        </div>
    );
};

export default GarbageRequestsPage;