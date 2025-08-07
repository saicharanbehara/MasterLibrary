import React, { useState } from 'react';
import axios from 'axios';
import '../AcquisitionType/AcquisitionType.css';

const AcquisitionType = () => {
    const [form, setForm] = useState({
        acquisitionTypeID: '',
        acquisitionTypeName: '',
        status: 'Active'
    });

    const [viewResults, setViewResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [message, setMessage] = useState('');
    const [operation,setOperation] = useState('');

    const apiUrl = 'https://localhost:7270/api/Master/AquisitionType';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const clearForm = () => {
        setForm({ acquisitionTypeID : '',
            acquisitionTypeName :  '',
            status : ''
        })
        setOperation('');
    };

    const handleInsert = async () => {
        setOperation('INSERT');
        try {
            const response = await axios.post(apiUrl, {
                flag: "INSERT",
                acquisitionTypeID: null,
                acquisitionTypeName: form.acquisitionTypeName,
                status: form.status
            });
            setMessage(response.data.MESSAGE || "Inserted.");
            clearForm();
            handleView();
        } catch (err) {
            setMessage("Insert failed: " + err.message);
            clearForm();
        }
    };

    const handleUpdate = async () => {
        if (!form.acquisitionTypeID) return setMessage("AcquisitionTypeID required for update.");
        setOperation('UPDATE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "UPDATE",
                acquisitionTypeID: parseInt(form.acquisitionTypeID),
                acquisitionTypeName: form.acquisitionTypeName,
                status: form.status
            });
            setMessage(response.data.MESSAGE || "Updated.");
            clearForm();
            handleView();
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
                acquisitionTypeID: form.acquisitionTypeID ? parseInt(form.acquisitionTypeID) : null,
                acquisitionTypeName: null,
                status: null
            });
            setViewResults(response.data.acquisitionTypeResponse || []);
            setMessage(response.data.MESSAGE || "Fetched.");
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
                acquisitionTypeID: deleteTarget.acquisitionTypeID || null,
                acquisitionTypeName: null,
                status: null
            });
            setMessage(response.data.MESSAGE || "Deleted.");
            setDeleteTarget(null);
            setShowDeleteConfirm(false);
            clearForm();
            handleView();
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
            acquisitionTypeID: item.acquisitionTypeID,
            acquisitionTypeName: item.acquisitionTypeName,
            status: item.status
        });
    };

    // Pagination Logic
    const indexOfLast = currentPage * resultsPerPage;
    const indexOfFirst = indexOfLast - resultsPerPage;
    const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(viewResults.length / resultsPerPage);

    return (
        <div className="AcquisitionType-container">
            {/* Left Pane */}
            <div className="AcquisitionType-form">
                <h2>AcquisitionType Manager</h2>
                <input
                    type="text"
                    name="acquisitionTypeID"
                    placeholder="AcquisitionType ID (auto)"
                    value={form.acquisitionTypeID}
                    onChange={handleChange}
                    className="AcquisitionType-input"
                    disabled={operation === "INSERT"}
                />
                <input
                    type="text"
                    name="acquisitionTypeName"
                    placeholder="AcquisitionType Name"
                    value={form.acquisitionTypeName}
                    onChange={handleChange}
                    className="AcquisitionType-input"
                />
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="AcquisitionType-input"
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <div className="button-group">
                    <button onClick={handleInsert} className="btn blue">Insert</button>
                    <button onClick={handleUpdate} className="btn green">Update</button>
                    <button onClick={handleView} className="btn purple">View</button>
                </div>
                <p className="status-message">{message}</p>
            </div>

            {/* Right Pane */}
            <div className="AcquisitionType-results">
                <h3>AcquisitionType Records</h3>
                <table className="AcquisitionType-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>AcquisitionType</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentResults.length === 0 ? (
                            <tr><td colSpan="4">No data found</td></tr>
                        ) : currentResults.map(item => (
                            <tr key={item.acquisitionTypeID}>
                                <td>{item.acquisitionTypeID}</td>
                                <td>{item.acquisitionTypeName}</td>
                                <td>{item.status}</td>
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
                        {['acquisitionTypeID', 'acquisitionTypeName', 'status'].map((key, i) => (
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

export default AcquisitionType;
