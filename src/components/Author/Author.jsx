import React, { useState } from 'react';
import axios from 'axios';
import '../Author/Author.css';

const Author = () => {
  const [form, setForm] = useState({
    authorID: '',
    authorName: '',
    nationality: '',
    birthDate: '',
    status: '',
  });

  const [viewResults, setViewResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [operation, setOperation] = useState('');

  const apiUrl = 'https://localhost:7270/api/Master/Author';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setForm({
      authorID: '',
      authorName: '',
      nationality: '',
      birthDate: '',
      status: '',
    });
    setOperation('');
  };

  const handleInsert = async () => {
    setOperation('INSERT');
    try {
      const response = await axios.post(apiUrl, {
        flag: 'INSERT',
        authorID: null,
        authorName: form.authorName,
        nationality: form.nationality,
        birthDate: form.birthDate,
        status: form.status,
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
    if (!form.authorID) {
      return setMessage('Author ID is required for update.');
    }
    setOperation('UPDATE');
    try {
      const response = await axios.post(apiUrl, {
        flag: 'UPDATE',
        authorID: parseInt(form.authorID),
        authorName: form.authorName,
        nationality: form.nationality,
        birthDate: form.birthDate,
        status: form.status,
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
      const response = await axios.post(apiUrl, {
        flag: 'VIEW',
        authorID: form.authorID ? parseInt(form.authorID) : null,
        authorName: form.authorName || null,
        nationality: form.nationality || null,
        birthDate: form.birthDate || null,
        status: form.status || null,
      });
      setViewResults(response.data.authorResponseList || []);
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
        authorID: deleteTarget.authorID || null,
        authorName: deleteTarget.authorName || null,
        nationality: null,
        birthDate: null,
        status: null,
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
      authorID: item.authorID,
      authorName: item.authorName,
      nationality: item.nationality,
      birthDate: item.birthDate?.split('T')[0],
      status: item.status,
    });
  };

  // Pagination Logic
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(viewResults.length / resultsPerPage);

  return (
    <div className="author-container">
      <div className="author-form">
        <h2>Author Manager</h2>
        <input
          type="text"
          name="authorID"
          placeholder="Author ID (auto)"
          value={form.authorID}
          onChange={handleChange}
          className="author-input"
          disabled={operation === 'INSERT'}
        />
        <input
          type="text"
          name="authorName"
          placeholder="Author Name"
          value={form.authorName}
          onChange={handleChange}
          className="author-input"
        />
        <input
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={form.nationality}
          onChange={handleChange}
          className="author-input"
        />
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="author-input"
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={form.status}
          onChange={handleChange}
          className="author-input"
        />
        <div className="button-group">
          <button onClick={handleInsert} className="btn blue">Insert</button>
          <button onClick={handleUpdate} className="btn green">Update</button>
          <button onClick={handleView} className="btn purple">View</button>
        </div>
        <p className="status-message">{message}</p>
      </div>

      <div className="author-results">
        <h3>Author Records</h3>
        <table className="author-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Author Name</th>
              <th>Nationality</th>
              <th>Birth Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length === 0 ? (
              <tr><td colSpan="6">No data found</td></tr>
            ) : (
              currentResults.map((item) => (
                <tr key={item.authorID}>
                  <td>{item.authorID}</td>
                  <td>{item.authorName}</td>
                  <td>{item.nationality}</td>
                  <td>{item.birthDate?.split('T')[0]}</td>
                  <td>{item.status}</td>
                  <td>
                    <button onClick={() => populateFormForUpdate(item)} className="btn grey">Update</button>
                    <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}>Next ➡</button>
        </div>
      </div>

      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🗑 Confirm Deletion</h3>
            {['authorID', 'authorName', 'nationality', 'birthDate', 'status'].map((key, i) => (
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

export default Author;
