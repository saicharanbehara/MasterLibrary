import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import CategoryCheckboxes from '../Category/CategoryCheckboxes';
import AcquisitionTypeCheckboxes from '../AcquisitionType/AcquisitionTypeCheckboxes';

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
    const [editMode, setEditMode] = useState(false);

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
                body: JSON.stringify({ Flag: "VIEW" })
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
            const response = await fetch('https://localhost:7270/api/Master/AquisitionType', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Flag: "VIEW" })
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
        setEditMode(false);
    };

    // Helper to build common full payload object
const buildPayload = (flag) => {
    const isInsert = flag === "INSERT";

    return {
        flag,
        vendorID: isInsert ? null : (form.VendorID ? parseInt(form.VendorID) : null),
        vendorName: form.VendorName || null,
        contactPerson: form.ContactPerson || null,
        phone: form.Phone || null,
        address: form.Address || null,

        vendorCategoryTypesVendor: form.categoryType.map(categoryID => (
            isInsert
                ? { categoryID, categoryName: null }
                : {
                    vendorID: form.VendorID ? parseInt(form.VendorID) : null,
                    categoryID,
                    categoryName: null
                }
        )),

        vendorAcquisitionTypeTypeVendor: form.acquisitionType.map(acquisitionTypeID => (
            isInsert
                ? { acquisitionTypeID, acquisitionTypeName: null }
                : {
                    vendorID: form.VendorID ? parseInt(form.VendorID) : null,
                    acquisitionTypeID,
                    acquisitionTypeName: null
                }
        ))
    };
};



    const handleInsert = async () => {
        const payload = buildPayload('INSERT');
        payload.vendorID = null; // Insert, so vendorID is null
        try {
            await axios.post(apiUrl, payload);
            setMessage('Vendor inserted successfully.');
            handleView();
            clearForm();
        } catch (err) {
            console.error(err);
            setMessage('Insert failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdate = async () => {
        const payload = buildPayload('UPDATE');
        try {
            await axios.post(apiUrl, payload);
            setMessage('Vendor updated successfully.');
            handleView();
            clearForm();
        } catch (err) {
            console.error(err);
            setMessage('Update failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleView = async () => {
        setOperation('VIEW');
        // For view, send a neutral payload with minimal filters or empty strings per your swagger example
        const payload = {
            flag: "VIEW",
            vendorID: null,
            vendorName: null,
            contactPerson: "string",
            phone: "string",
            address: "string",
            vendorCategoryTypesVendor: [{
                vendorID: null,
                categoryID: 0,
                categoryName: "string"
            }],
            vendorAcquisitionTypeTypeVendor: [{
                vendorID: null,
                acquisitionTypeID: 0,
                acquisitionTypeName: "string"
            }]
        };
        try {
            const response = await axios.post(apiUrl, payload);
            const results = response.data.vendorResponseList || [];
            setViewResults(results);
            setMessage(response.data.message || "Fetched vendors.");
            setCurrentPage(1);
            clearForm();
        } catch (err) {
            setMessage("View failed: " + (err.response?.data?.message || err.message));
            clearForm();
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setOperation('DELETE');
        const payload = {
            flag: "DELETE",
            vendorID: deleteTarget.VendorID,
            vendorName: null,
            contactPerson: null,
            phone: null,
            address: null,
            vendorCategoryTypesVendor: [],
            vendorAcquisitionTypeTypeVendor: []
        };
        try {
            const response = await axios.post(apiUrl, payload);
            setMessage(response.data.message || "Deleted.");
            setDeleteTarget(null);
            setShowDeleteConfirm(false);
            handleView();
            clearForm();
        } catch (err) {
            setMessage("Delete failed: " + (err.response?.data?.message || err.message));
            clearForm();
        }
    };

    const confirmDelete = (item) => {
        setDeleteTarget(item);
        setShowDeleteConfirm(true);
    };

const populateFormForUpdate = (item) => {
    setForm({
        VendorID: item.vendorID, // 👈 match with backend's case
        VendorName: item.vendorName,
        ContactPerson: item.contactPerson,
        Phone: item.phone,
        Address: item.address,
        categoryType: item.vendorCategoryTypeResponseList?.map(c => c.categoryID) || [],
        acquisitionType: item.vendorAcquisitionTypeTypesResponseList?.map(a => a.acquisitionTypeID) || []
    });
    setEditMode(true);
};


    const getCategoryNames = (ids) => {
        return ids.map(id => categories.find(cat => cat.CategoryID === id)?.CategoryName).filter(Boolean).join(', ');
    };

    const getAcquisitionNames = (ids) => {
        return ids.map(id => acquisitionTypes.find(acq => acq.AcquisitionTypeID === id)?.AcquisitionTypeName).filter(Boolean).join(', ');
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
                    disabled
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
        <CategoryCheckboxes
            selected={form.categoryType}
            onToggle={handleCategoryChange}
        />
    </div>
    <p className="selection-count">Selected: {form.categoryType.length} categories</p>
</div>

                {/* Acquisition Types Section */}
<div className="acquisition-section">
    <h3>Acquisition Types</h3>
    <div className="checkbox-grid">
        <AcquisitionTypeCheckboxes
            selected={form.acquisitionType}
            onToggle={handleAcquisitionChange}
        />
    </div>
    <p className="selection-count">Selected: {form.acquisitionType.length} acquisition types</p>
</div>



                {/* Action Buttons */}
                <div className="button-group">
                    <button onClick={handleInsert} className="btn blue" disabled={editMode}>Insert</button>
                    <button onClick={handleUpdate} className="btn green" disabled={!editMode}>Update</button>
                    <button onClick={handleView} className="btn purple">View</button>
                    <button onClick={clearForm} className="btn grey">Clear</button>
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
                            <th>Categories</th>
                            <th>Acquisitions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
<tbody>
  {currentResults.length === 0 ? (
    <tr><td colSpan="8">No data found</td></tr>
  ) : currentResults.map(item => (
    <tr key={item.vendorID}>
      <td>{item.vendorID}</td>
      <td>{item.vendorName}</td>
      <td>{item.contactPerson}</td>
      <td>{item.phone}</td>
      <td>{item.address}</td>
      <td>{getCategoryNames(item.vendorCategoryTypeResponseList?.map(c => c.categoryID) || [])}</td>
      <td>{getAcquisitionNames(item.vendorAcquisitionTypeTypesResponseList?.map(a => a.acquisitionTypeID) || [])}</td>
      <td>
        <button onClick={() => populateFormForUpdate(item)} className="btn yellow">Edit</button>
        <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
      </td>
    </tr>
  ))}
</tbody>

                </table>

                {/* Pagination Controls */}
                {viewResults.length > resultsPerPage && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                          ⬅  Prev
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next ➡
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete</p>
                        
                        <p><strong>Vendor ID :</strong>{deleteTarget?.vendorID}</p>
                        <p><strong>VendorName :</strong>{deleteTarget?.vendorName}</p>
                        <p><strong>ContactPerson :</strong>{deleteTarget?.contactPerson}</p>
                        <p><strong>Phone :</strong>{deleteTarget?.phone}</p>
                        <p><strong>Address :</strong>{deleteTarget?.address}</p>
                        <button onClick={handleDelete} className="btn red">Confirm Delete</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn grey">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendor;

