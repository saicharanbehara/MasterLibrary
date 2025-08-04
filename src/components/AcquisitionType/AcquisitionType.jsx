import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import '../AcquisitionType/AcquisitionType.css'


const AcquisitionType = () => {
    const [form, setForm] = useState({
        AcquisitionTypeID: '',
        AcquisitionTypeName: '',
        status: 'Active'
    });
    
    const [viewResults, setViewResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [message, setMessage] = useState('');
    const [operation, setOperation] = useState('');

    const resultsPerPage = 5;
    const apiUrl = 'https://localhost:7270/api/Master/AcquisitionType';

    useEffect(() => { 
        if (message)
            {
                const timer = setTimeout(() => setMessage(''), 3000);
                return () => clearTimeout(timer);
            } }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value })); };

    const clearForm = () => {
        setForm({ AcquisitionTypeID: '', AcquisitionTypeName: '', status: 'Active' });
        setOperation(''); };
    
    const handleInsert = async () => {
        setOperation('INSERT');
        try {
            const response = await axios.post(apiUrl, {
                flag: "INSERT",
                AcquisitionTypeID: null,
                AcquisitionTypeName: form.AcquisitionTypeName,
                status: form.status
            });
            setMessage(response.data.MESSAGE || "Inserted.");
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Insert failed: " + err.message);
        }
    };

    const handleUpdate = async () => {
        if (!form.AcquisitionTypeID) return setMessage("AcquisitionTypeID required for update.");
        setOperation('UPDATE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "UPDATE",
                AcquisitionTypeID: parseInt(form.AcquisitionTypeID),
                AcquisitionTypeName: form.AcquisitionTypeName,
                status: form.status
            });
            setMessage(response.data.MESSAGE || "Updated.");
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Update failed: " + err.message);
        }
    };

    const handleView = async () => {
        setOperation('VIEW');
        try {
            const response = await axios.post(apiUrl, {
                flag: "VIEW",
                AcquisitionTypeID: form.AcquisitionTypeID ? parseInt(form.AcquisitionTypeID) : null,
                AcquisitionTypeName: form.AcquisitionTypeName || null,
                status: form.status || null
            });
            const data = response.data.AcquisitionType || [];
            setViewResults(data);
            setMessage(response.data.MESSAGE || "Fetched.");
            setCurrentPage(1);
        } catch (err) {
            setMessage("View failed: " + err.message);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setOperation('DELETE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "DELETE",
                AcquisitionTypeID: parseInt(deleteTarget.AcquisitionTypeID),
                AcquisitionTypeName: null,
                status: null
            });
            setMessage(response.data.MESSAGE || "Deleted.");
            setDeleteTarget(null);
            setShowDeleteConfirm(false);
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Delete failed: " + err.message);
        }
    };

    const confirmDelete = (item) => {
        setDeleteTarget(item);
        setShowDeleteConfirm(true);
    };

    const populateFormForUpdate = (item) => {
        setForm({
            AcquisitionTypeID: item.AcquisitionTypeID,
            AcquisitionTypeName: item.AcquisitionTypeName,
            status: item.status
        });
    };

    const indexOfLast = currentPage * resultsPerPage;
    const indexOfFirst = indexOfLast - resultsPerPage;
    const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(viewResults.length / resultsPerPage);

  return (
    <div className="AcquisitionType-container">
            <div className="AcquisitionType-form">
                <h2>AcquisitionType Manager</h2>
                <input
                    type="text"
                    name="AcquisitionTypeID"
                    placeholder="AcquisitionType ID"
                    value={form.AcquisitionTypeID}
                    onChange={handleChange}
                    className="AcquisitionType-input"
                    disabled={operation === 'INSERT'}
                />
                <input
                    type="text"
                    name="AcquisitionTypeName"
                    placeholder="AcquisitionType Name"
                    value={form.AcquisitionTypeName}
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

            <div className="AcquisitionType-results">
                <h3>AcquisitionType Records</h3>
                <table className="AcquisitionType-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>AcquisitionType Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentResults.length === 0 ? (
                            <tr><td colSpan="4">No data found</td></tr>
                        ) : currentResults.map(item => (
                            <tr key={item.AcquisitionTypeID}>
                                <td>{item.AcquisitionTypeID}</td>
                                <td>{item.AcquisitionTypeName}</td>
                                <td>{item.status}</td>
                                <td>
                                    <button onClick={() => populateFormForUpdate(item)} className="btn grey">Update</button>
                                    <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}>Next ➡</button>
                </div>
            </div>

            {showDeleteConfirm && deleteTarget && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>🗑 Confirm Deletion</h3>
                        <p><strong>ID:</strong> {deleteTarget.AcquisitionTypeID}</p>
                        <p><strong>Name:</strong> {deleteTarget.AcquisitionTypeName}</p>
                        <p><strong>Status:</strong> {deleteTarget.status}</p>
                        <div className="button-group">
                            <button onClick={handleDelete} className="btn red">Confirm Delete</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn grey">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
  )
}

export default AcquisitionType