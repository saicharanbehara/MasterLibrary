import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AcquisitionType.css';

const AcquisitionType = () => {
  const [form, setForm] = useState({
    acquisitionTypeID: '',
    acquisitionTypeName: '',
    status: 'Active',
  });

  const [viewResults, setViewResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [operation, setOperation] = useState('');

  const apiUrl = 'https://localhost:7270/api/Master/AquisitionType';

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setForm({ acquisitionTypeID: '', acquisitionTypeName: '', status: 'Active' });
    setOperation('');
  };

  const handleInsert = async () => {
    setOperation('INSERT');
    try {
      const response = await axios.post(apiUrl, {
        Flag: 'INSERT',
        AcquisitionTypeID: null,
        AcquisitionTypeName: form.acquisitionTypeName,
        Status: form.status,
      }, { headers: { 'Content-Type': 'application/json' } });

      setMessage(response.data.message || 'Inserted.');
      await handleView();
      clearForm();
    } catch (err) {
      setMessage('Insert failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async () => {
    if (!form.acquisitionTypeID) return setMessage('acquisitionTypeID required for update.');
    setOperation('UPDATE');
    try {
      const response = await axios.post(apiUrl, {
        Flag: 'UPDATE',
        AcquisitionTypeID: parseInt(form.acquisitionTypeID),
        AcquisitionTypeName: form.acquisitionTypeName,
        Status: form.status,
      }, { headers: { 'Content-Type': 'application/json' } });

      setMessage(response.data.message || 'Updated.');
      await handleView();
      clearForm();
    } catch (err) {
      setMessage('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleView = async () => {
    setOperation('VIEW');
    try {
      const response = await axios.post(apiUrl, {
        Flag: 'VIEW',
        AcquisitionTypeID: form.acquisitionTypeID ? parseInt(form.acquisitionTypeID) : null,
        AcquisitionTypeName: form.acquisitionTypeName || null,
        Status: form.status || null,
      }, { headers: { 'Content-Type': 'application/json' } });

      console.log('API Response:', response.data);

      const data = response.data.acquisitionTypeResponse || [];
      if (!Array.isArray(data)) {
        setMessage('Unexpected response format.');
        return;
      }

      setViewResults(data);
      setMessage(response.data.message || 'Fetched.');
      setCurrentPage(1);
    } catch (err) {
      console.error('View error:', err);
      setMessage('View failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setOperation('DELETE');
    try {
      const response = await axios.post(apiUrl, {
        Flag: 'DELETE',
        AcquisitionTypeID: parseInt(deleteTarget.acquisitionTypeID),
        AcquisitionTypeName: null,
        Status: null,
      }, { headers: { 'Content-Type': 'application/json' } });

      setMessage(response.data.message || 'Deleted.');
      setDeleteTarget(null);
      setShowDeleteConfirm(false);
      await handleView();
      clearForm();
    } catch (err) {
      setMessage('Delete failed: ' + (err.response?.data?.message || err.message));
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
      status: item.status,
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
          name="acquisitionTypeID"
          placeholder="Acquisition Type ID"
          value={form.acquisitionTypeID}
          onChange={handleChange}
          className="AcquisitionType-input"
          disabled={operation === 'INSERT'}
        />
        <input
          type="text"
          name="acquisitionTypeName"
          placeholder="Acquisition Type Name"
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

      <div className="AcquisitionType-results">
        <h3>AcquisitionType Records</h3>
        <table className="AcquisitionType-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length > 0 ? (
              currentResults.map((item) => (
                <tr key={`row-${item.acquisitionTypeID}`}>
                  <td>{item.acquisitionTypeID}</td>
                  <td>{item.acquisitionTypeName}</td>
                  <td>{item.status}</td>
                  <td>
                    <button onClick={() => populateFormForUpdate(item)} className="btn grey">Update</button>
                    <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="no-data-row"><td colSpan="4">No data found</td></tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next ➡</button>
        </div>
      </div>

      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🗑 Confirm Deletion</h3>
            <p><strong>ID:</strong> {deleteTarget.acquisitionTypeID}</p>
            <p><strong>Name:</strong> {deleteTarget.acquisitionTypeName}</p>
            <p><strong>Status:</strong> {deleteTarget.status}</p>
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
