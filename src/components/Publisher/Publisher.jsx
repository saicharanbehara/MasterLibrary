import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Publisher/Publisher.css';

const Publisher = () => {
  const [form, setForm] = useState({
    publisherId: '',
    publisherName: '',
    publisherCode: '',
    isAvailable: 'True',
  });

  const [viewResults, setViewResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [operation, setOperation] = useState('');

  const apiUrl = 'https://localhost:7270/api/Master/Publisher';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setForm({
      publisherId: '',
      publisherName: '',
      publisherCode: '',
      isAvailable: 'True',
    });
    setOperation('');
  };

  const handleInsert = async () => {
    setOperation('INSERT');
    try {
      const response = await axios.post(apiUrl, {
        flag: 'INSERT',
        publisherId: null,
        publisherName: form.publisherName,
        publisherCode: form.publisherCode,
        isAvailable: form.isAvailable === 'True',
      });
      setMessage(response.data.MESSAGE || 'Inserted.');
      clearForm();
      handleView();
    } catch (err) {
      setMessage('Insert failed: ' + err.message);
      clearForm();
    }
  };

  const handleUpdate = async () => {
    if (!form.publisherId) {
      return setMessage('Publisher ID is required for update.');
    }
    setOperation('UPDATE');
    try {
      const response = await axios.post(apiUrl, {
        flag: 'UPDATE',
        publisherId: parseInt(form.publisherId),
        publisherName: form.publisherName,
        publisherCode: form.publisherCode,
        isAvailable: form.isAvailable === 'True',
      });
      setMessage(response.data.MESSAGE || 'Updated.');
      clearForm();
      handleView();
    } catch (err) {
      setMessage('Update failed: ' + err.message);
      clearForm();
    }
  };

  const handleView = async () => {
    setOperation('VIEW');
    try {
      console.log('VIEW triggered');
      const response = await axios.post(apiUrl, {
        flag: 'VIEW',
        publisherId: form.publisherId ? parseInt(form.publisherId) : null,
        publisherName: form.publisherName || null,
        publisherCode: form.publisherCode || null,
        isAvailable: form.isAvailable === 'True',
      });
      console.log('API response:', response.data);
      setViewResults(response.data.Variables || []);
      setMessage(response.data.MESSAGE?.trim() || 'Fetched.');
      setCurrentPage(1);
      clearForm();
    } catch (err) {
      setMessage('View failed: ' + err.message);
      clearForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setOperation('DELETE');
    try {
      const response = await axios.post(apiUrl, {
        flag: 'DELETE',
        publisherId: deleteTarget.publisherId || null,
        publisherName: deleteTarget.publisherName || null,
        publisherCode: null,
        isAvailable: null,
      });
      setMessage(response.data.MESSAGE || 'Deleted.');
      setDeleteTarget(null);
      setShowDeleteConfirm(false);
      clearForm();
      handleView();
    } catch (err) {
      setMessage('Delete failed: ' + err.message);
      clearForm();
    }
  };

  const confirmDelete = (item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const populateFormForUpdate = (item) => {
    setForm({
      publisherId: item.publisherId,
      publisherName: item.publisherName,
      publisherCode: item.publisherCode,
      isAvailable: item.isAvailable ? 'True' : 'False',
    });
  };

  // Pagination Logic
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(viewResults.length / resultsPerPage);

  // Debug log when viewResults changes
  useEffect(() => {
    console.log('viewResults updated:', viewResults);
  }, [viewResults]);

  return (
    <div className="publisher-container">
      {/* Left Pane */}
      <div className="publisher-form">
        <h2>Publisher Manager</h2>
        <input
          type="text"
          name="publisherId"
          placeholder="Publisher ID (auto)"
          value={form.publisherId}
          onChange={handleChange}
          className="publisher-input"
          disabled={operation === 'INSERT'}
        />
        <input
          type="text"
          name="publisherName"
          placeholder="Publisher Name"
          value={form.publisherName}
          onChange={handleChange}
          className="publisher-input"
        />
        <input
          type="text"
          name="publisherCode"
          placeholder="Publisher Code"
          value={form.publisherCode}
          onChange={handleChange}
          className="publisher-input"
        />
        <select
          name="isAvailable"
          value={form.isAvailable}
          onChange={handleChange}
          className="publisher-input"
        >
          <option value="True">True</option>
          <option value="False">False</option>
        </select>

        <div className="button-group">
          <button onClick={handleInsert} className="btn blue">
            Insert
          </button>
          <button onClick={handleUpdate} className="btn green">
            Update
          </button>
          <button onClick={handleView} className="btn purple">
            View
          </button>
        </div>
        <p className="status-message">{message}</p>
      </div>

      {/* Right Pane */}
      <div className="publisher-results">
        <h3>Publisher Records</h3>
        <table className="publisher-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Publisher Name</th>
              <th>Publisher Code</th>
              <th>Is Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length === 0 ? (
              <tr>
                <td colSpan="5">No data found</td>
              </tr>
            ) : (
              currentResults.map((item) => (
                <tr key={item.publisherId}>
                  <td>{item.publisherId}</td>
                  <td>{item.publisherName}</td>
                  <td>{item.publisherCode}</td>
                  <td>{item.isAvailable ? 'True' : 'False'}</td>
                  <td>
                    <button
                      onClick={() => populateFormForUpdate(item)}
                      className="btn grey"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="btn red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ⬅ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next ➡
          </button>
        </div>
      </div>

      {/* Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🗑 Confirm Deletion</h3>
            {['publisherId', 'publisherName', 'publisherCode', 'isAvailable'].map(
              (key, i) => (
                <p key={i}>
                  <strong>{key}:</strong>{' '}
                  {key === 'isAvailable'
                    ? deleteTarget[key]
                      ? 'True'
                      : 'False'
                    : deleteTarget[key]}
                </p>
              )
            )}
            <div className="button-group">
              <button onClick={handleDelete} className="btn red">
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn grey"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publisher;
