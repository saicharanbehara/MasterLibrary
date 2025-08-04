import React, { useState } from 'react';
import axios from 'axios';
import '../Location/Location.css';

const Location = () => {
    const [form, setForm] = useState({
        locationId: '',
        floor: '',
        section: '',
        shelf: '',
        locationName: ''
    });

    const [viewResults, setViewResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 6;

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [message, setMessage] = useState('');
    const [operation,setOperation] = useState('');

    const apiUrl = 'https://localhost:7270/api/Location/Location';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const clearForm = () => {
        setForm({ locationId : '',
            floor :  '',
            section : '',
            shelf : '',
            locationName : '',
        })
        setOperation('');
    };

    const handleInsert = async () => {
        setOperation('INSERT');
        try {
            const response = await axios.post(apiUrl, {
                flag: "INSERT",
                locationId: null,
                floor: form.floor,
                section: form.section,
                shelf: form.shelf,
                locationName: null
            });
            setMessage(response.data.message || "Inserted.");
            setForm({ locationId: '', floor: '', section: '', shelf: '', locationName: '' });
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Insert failed: " + err.message);
            clearForm();
        }
    };

    const handleUpdate = async () => {
        if (!form.locationId) return setMessage("LocationID required for update.");
        setOperation('UPDATE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "UPDATE",
                locationId: form.locationId,
                floor: form.floor,
                section: form.section,
                shelf: form.shelf,
                locationName: null
            });
            setMessage(response.data.message || "Updated.");
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Update failed: " + err.message);
            clearForm();
        }
    };

    const handleView = async () => {
        setOperation('VIEW');
        try {
            const response = await axios.post(apiUrl, {
                flag: "VIEW",
                locationId: form.locationId ? parseInt(form.locationId) : null,
                floor: null,
                section: null,
                shelf: null,
                locationName: form.locationName || null
            });
            setViewResults(response.data.variables || []);
            setMessage(response.data.message || "Fetched.");
            setCurrentPage(1);
            clearForm();
        } catch (err) {
            setMessage("View failed: " + err.message);
            clearForm();
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setOperation('DELETE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "DELETE",
                locationId: deleteTarget.locationId || null,
                floor: null,
                section: null,
                shelf: null,
                locationName: deleteTarget.locationName || null
            });
            setMessage(response.data.message || "Deleted.");
            setDeleteTarget(null);
            setShowDeleteConfirm(false);
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Delete failed: " + err.message);
            clearForm();
        }
    };

    const confirmDelete = (item) => {
        setDeleteTarget(item);
        setShowDeleteConfirm(true);
    };

    const populateFormForUpdate = (item) => {
        setForm({
            locationId: item.locationId,
            floor: item.floor,
            section: item.section,
            shelf: item.shelf,
            locationName: item.locationName
        });
    };

    // Pagination Logic
    const indexOfLast = currentPage * resultsPerPage;
    const indexOfFirst = indexOfLast - resultsPerPage;
    const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(viewResults.length / resultsPerPage);

    return (
        <div className="location-container">
            {/* Left Pane */}
            <div className="location-form">
                <h2>Location Manager</h2>
                <input
                    type="text"
                    name="locationId"
                    placeholder="Location ID (auto)"
                    value={form.locationId}
                    onChange={handleChange}
                    className="location-input"
                    disabled={operation == "INSERT"}
                />
                <input
                    type="text"
                    name="floor"
                    placeholder="Floor"
                    value={form.floor}
                    onChange={handleChange}
                    className="location-input"
                />
                <input
                    type="text"
                    name="section"
                    placeholder="Section"
                    value={form.section}
                    onChange={handleChange}
                    className="location-input"
                />
                <input
                    type="text"
                    name="shelf"
                    placeholder="Shelf"
                    value={form.shelf}
                    onChange={handleChange}
                    className="location-input"
                />
                <input
                    type="text"
                    name="locationName"
                    placeholder="Location Name"
                    value={form.locationName}
                    onChange={handleChange}
                    className="location-input"
                />

                <div className="button-group">
                    <button onClick={handleInsert} className="btn blue">Insert</button>
                    <button onClick={handleUpdate} className="btn green">Update</button>
                    <button onClick={handleView} className="btn purple">View</button>
                </div>
                <p className="status-message">{message}</p>
            </div>

            {/* Right Pane */}
            <div className="location-results">
                <h3>Location Records</h3>
                <table className="location-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Floor</th>
                            <th>Section</th>
                            <th>Shelf</th>
                            <th>Location Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentResults.length === 0 ? (
                            <tr><td colSpan="6">No data found</td></tr>
                        ) : currentResults.map(item => (
                            <tr key={item.locationId}>
                                <td>{item.locationId}</td>
                                <td>{item.floor}</td>
                                <td>{item.section}</td>
                                <td>{item.shelf}</td>
                                <td>{item.locationName}</td>
                                <td>
                                    <button onClick={() => populateFormForUpdate(item)} className="btn grey">Update</button>
                                    <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}>
                        ⬅ Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}>
                        Next ➡
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showDeleteConfirm && deleteTarget && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>🗑 Confirm Deletion</h3>
                        {['locationId', 'locationName', 'floor', 'section', 'shelf'].map((key, i) => (
                            <p key={i}><strong>{key}:</strong> {deleteTarget[key]}</p>
                        ))}
                        <div className="button-group">
                            <button onClick={handleDelete} className="btn red">Confirm Delete</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn grey">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Location;
