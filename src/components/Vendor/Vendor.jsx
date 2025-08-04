import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Vendor/Vendor.css';

const Vendor = () => {
    const [form, setForm] = useState({
        VendorID: '',
        VendorName: '',
        ContactPerson: '',
        Phone: '',
        Address: '',
        categoryType: [],
        acquisitionType: [],
    });

    const [viewResults, setViewResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [message, setMessage] = useState('');
    const [operation, setOperation] = useState('');
    const [categories, setCategories] = useState([]);
    const [acquisitionTypes, setAcquisitionTypes] = useState([]);

    const resultsPerPage = 5;
    const apiUrl = 'https://localhost:7270/api/Master/Vendor';

    useEffect(() => {
        fetchCategories();
        fetchAcquisitionTypes();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://localhost:7270/api/Master/Category', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flag: "VIEW" })
            });
            const data = await response.json();
            setCategories(data.variables || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setMessage('Failed to load categories');
        }
    };

    const fetchAcquisitionTypes = async () => {
        try {
            const response = await fetch('https://localhost:7270/api/Master/AcquisitionType', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flag: "VIEW" })
            });
            const data = await response.json();
            setAcquisitionTypes(data.variables || []);
        } catch (err) {
            console.error('Error fetching acquisition types:', err);
            setMessage('Failed to load acquisition types');
        }
    };

    const handleCategoryChange = (categoryId) => {
        setForm(prev => ({
            ...prev,
            categoryType: prev.categoryType.includes(categoryId)
                ? prev.categoryType.filter(id => id !== categoryId)
                : [...prev.categoryType, categoryId]
        }));
    };

    const handleAcquisitionChange = (acquisitionId) => {
        setForm(prev => ({
            ...prev,
            acquisitionType: prev.acquisitionType.includes(acquisitionId)
                ? prev.acquisitionType.filter(id => id !== acquisitionId)
                : [...prev.acquisitionType, acquisitionId]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const clearForm = () => {
        setForm({
            VendorID: '',
            VendorName: '',
            ContactPerson: '',
            Phone: '',
            Address: '',
            categoryType: [],
            acquisitionType: [],
        });
        setOperation('');
    };

    const handleInsert = async () => {
        setOperation('INSERT');
        try {
            const response = await axios.post(apiUrl, {
                flag: "INSERT",
                VendorID: null,
                VendorName: form.VendorName,
                ContactPerson: form.ContactPerson,
                Phone: form.Phone,
                Address: form.Address,
                vendorCategoryTypesVendor: form.categoryType.map(catId => ({
                    VendorID: null,
                    CategoryID: catId
                })),
                vendorAcquisitionTypeTypeVendor: form.acquisitionType.map(acqId => ({
                    VendorID: null,
                    AcquisitionTypeID: acqId
                }))
            });
            setMessage(response.data.message || "Inserted.");
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Insert failed: " + err.message);
            clearForm();
        }
    };

    const handleUpdate = async () => {
        if (!form.VendorID) return setMessage("VendorID required for update.");
        setOperation('UPDATE');
        try {
            const response = await axios.post(apiUrl, {
                flag: "UPDATE",
                VendorID: form.VendorID,
                VendorName: form.VendorName,
                ContactPerson: form.ContactPerson,
                Phone: form.Phone,
                Address: form.Address,
                vendorCategoryTypesVendor: form.categoryType.map(catId => ({
                    VendorID: form.VendorID,
                    CategoryID: catId
                })),
                vendorAcquisitionTypeTypeVendor: form.acquisitionType.map(acqId => ({
                    VendorID: form.VendorID,
                    AcquisitionTypeID: acqId
                }))
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
                VendorID: form.VendorID ? parseInt(form.VendorID) : null,
                VendorName: null,
                ContactPerson: null,
                Phone: null,
                Address: null
            });

            const results = response.data.variables || [];

            setViewResults(results);
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
                VendorID: deleteTarget.VendorID
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
            VendorID: item.VendorID,
            VendorName: item.VendorName,
            ContactPerson: item.ContactPerson,
            Phone: item.Phone,
            Address: item.Address,
            categoryType: item.vendorCategoryTypeResponseList?.map(c => c.CategoryID) || [],
            acquisitionType: item.vendorAcquisitionTypeTypesResponseList?.map(a => a.AcquisitionTypeID) || []
        });
    };

    const indexOfLast = currentPage * resultsPerPage;
    const indexOfFirst = indexOfLast - resultsPerPage;
    const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(viewResults.length / resultsPerPage);

    return (
        <div className="vendor-container">
            <div className="vendor-form">
    <h2>Vendor Manager</h2>

    <input
        type="text"
        name="VendorID"
        placeholder="Vendor ID (auto)"
        value={form.VendorID}
        onChange={handleChange}
        className="Vendor-input"
        disabled={operation === "INSERT"}
    />

    <input
        type="text"
        name="VendorName"
        placeholder="Vendor Name"
        value={form.VendorName}
        onChange={handleChange}
        className="Vendor-input"
    />

    <input
        type="text"
        name="ContactPerson"
        placeholder="Contact Person"
        value={form.ContactPerson}
        onChange={handleChange}
        className="Vendor-input"
    />

    <input
        type="text"
        name="Phone"
        placeholder="Phone"
        value={form.Phone}
        onChange={handleChange}
        className="Vendor-input"
    />

    <input
        type="text"
        name="Address"
        placeholder="Address"
        value={form.Address}
        onChange={handleChange}
        className="Vendor-input"
    />

    {/* Category Types Section */}
    <div className="category-section">
        <h3>Category Types</h3>
        <div className="checkbox-grid">
            {categories.length > 0 ? (
                categories.map(category => (
                    <label key={category.CategoryID} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={form.categoryType.includes(category.CategoryID)}
                            onChange={() => handleCategoryChange(category.CategoryID)}
                        />
                        <span>{category.CategoryName}</span>
                    </label>
                ))
            ) : (
                <p>No categories available</p>
            )}
        </div>
        <p className="selection-count">Selected: {form.categoryType.length} categories</p>
    </div>

    {/* Acquisition Types Section */}
    <div className="acquisition-section">
        <h3>Acquisition Types</h3>
        <div className="checkbox-grid">
            {acquisitionTypes.length > 0 ? (
                acquisitionTypes.map(acq => (
                    <label key={acq.AcquisitionTypeID} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={form.acquisitionType.includes(acq.AcquisitionTypeID)}
                            onChange={() => handleAcquisitionChange(acq.AcquisitionTypeID)}
                        />
                        <span>{acq.AcquisitionTypeName}</span>
                    </label>
                ))
            ) : (
                <p>No acquisition types available</p>
            )}
        </div>
        <p className="selection-count">Selected: {form.acquisitionType.length} acquisition types</p>
    </div>

    {/* Action Buttons */}
    <div className="button-group">
        <button onClick={handleInsert} className="btn blue">Insert</button>
        <button onClick={handleUpdate} className="btn green">Update</button>
        <button onClick={handleView} className="btn purple">View</button>
    </div>

    <p className="status-message">{message}</p>
</div>


            <div className="vendor-results">
                <h3>Vendor Records</h3>
                <table className="vendor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vendor</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentResults.length === 0 ? (
                            <tr><td colSpan="6">No data found</td></tr>
                        ) : currentResults.map(item => (
                            <tr key={item.VendorID}>
                                <td>{item.VendorID}</td>
                                <td>{item.VendorName}</td>
                                <td>{item.ContactPerson}</td>
                                <td>{item.Phone}</td>
                                <td>{item.Address}</td>
                                <td>
                                    <button onClick={() => populateFormForUpdate(item)} className="btn grey">Update</button>
                                    <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>⬅ Prev</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next ➡</button>
                </div>
            </div>

            {showDeleteConfirm && deleteTarget && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>🗑 Confirm Deletion</h3>
                        {['VendorID', 'VendorName', 'ContactPerson', 'Phone', 'Address'].map((key, i) => (
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

export default Vendor;
