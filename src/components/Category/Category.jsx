import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Category/Category.css';

const Category = () => {
    const [form, setForm] = useState({
        categoryId: '',
        categoryName: '',
        status: 'Active'
    });

    const [viewResults, setViewResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [message, setMessage] = useState('');
    const [operation, setOperation] = useState('');

    const resultsPerPage = 5;
    const apiUrl = 'https://localhost:7270/api/Master/Category';

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value })); 
    };

    const clearForm = () => {
        setForm({ categoryId: '', categoryName: '', status: 'Active' });
        setOperation('');
    };

    const handleInsert = async () => {
        setOperation('INSERT');
        try {
            const response = await axios.post(apiUrl, {
                flag: "INSERT",
                categoryID: null,
                categoryName: form.categoryName,
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
        if (!form.categoryId) return setMessage("CategoryID required for update.");
        setOperation('UPDATE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "UPDATE",
                categoryID: parseInt(form.categoryId),
                categoryName: form.categoryName,
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
                categoryID: form.categoryId ? parseInt(form.categoryId) : null,
                categoryName: form.categoryName || null,
                status: form.status || null
            });
            const data = response.data.category_Variables || [];
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
                categoryID: parseInt(deleteTarget.categoryID),
                categoryName: null,
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
            categoryId: item.categoryID,
            categoryName: item.categoryName,
            status: item.status
        });
    };

    const indexOfLast = currentPage * resultsPerPage;
    const indexOfFirst = indexOfLast - resultsPerPage;
    const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(viewResults.length / resultsPerPage);

    return (
        <div className="category-container">
            <div className="category-form">
                <h2>Category Manager</h2>
                <input
                    type="text"
                    name="categoryId"
                    placeholder="Category ID"
                    value={form.categoryId} // ✅ fixed
                    onChange={handleChange}
                    className="category-input"
                    disabled={operation === 'INSERT'}
                />
                <input
                    type="text"
                    name="categoryName"
                    placeholder="Category Name"
                    value={form.categoryName}
                    onChange={handleChange}
                    className="category-input"
                />
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="category-input"
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

            <div className="category-results">
                <h3>Category Records</h3>
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentResults.length === 0 ? (
                            <tr><td colSpan="4">No data found</td></tr>
                        ) : currentResults.map(item => (
                            <tr key={item.categoryID}>
                                <td>{item.categoryID}</td>
                                <td>{item.categoryName}</td>
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
                        <p><strong>ID:</strong> {deleteTarget.categoryID}</p>
                        <p><strong>Name:</strong> {deleteTarget.categoryName}</p>
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
export default Category;