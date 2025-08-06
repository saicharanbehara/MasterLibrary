import React, { useState } from 'react';
import axios from 'axios';
import '../Vendor/Vendor.css';
import CategoryCheckboxes from '../Category/CategoryCheckboxes';
import AcquisitionTypeCheckboxes from '../AcquisitionType/AcquisitionTypeCheckboxes';

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
  const [editMode, setEditMode] = useState(false);

  const resultsPerPage = 5;
  const apiUrl = 'https://localhost:7270/api/Master/Vendor';

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
    setEditMode(false);
    setMessage('');
  };

  const buildPayload = (flag) => {
    const isInsert = flag === 'INSERT';
    return {
      flag,
      vendorID: isInsert ? null : parseInt(form.VendorID) || null,
      vendorName: form.VendorName || null,
      contactPerson: form.ContactPerson || null,
      phone: form.Phone || null,
      address: form.Address || null,
      vendorCategoryTypesVendor: form.categoryType.map(categoryID => ({
        vendorID: isInsert ? null : parseInt(form.VendorID),
        categoryID,
        categoryName: null
      })),
      vendorAcquisitionTypeTypeVendor: form.acquisitionType.map(acquisitionTypeID => ({
        vendorID: isInsert ? null : parseInt(form.VendorID),
        acquisitionTypeID,
        acquisitionTypeName: null
      }))
    };
  };

  const handleInsert = async () => {
    const payload = buildPayload('INSERT');
    try {
      await axios.post(apiUrl, payload);
      setMessage('Vendor inserted.');
      handleView();
      clearForm();
    } catch (err) {
      setMessage('Insert failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async () => {
    const payload = buildPayload('UPDATE');
    try {
      await axios.post(apiUrl, payload);
      setMessage('Vendor updated.');
      handleView();
      clearForm();
    } catch (err) {
      setMessage('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleView = async () => {
    const payload = {
      flag: 'VIEW',
      vendorID: null,
      vendorName: null,
      contactPerson: 'string',
      phone: 'string',
      address: 'string',
      vendorCategoryTypesVendor: [{ vendorID: null, categoryID: 0, categoryName: 'string' }],
      vendorAcquisitionTypeTypeVendor: [{ vendorID: null, acquisitionTypeID: 0, acquisitionTypeName: 'string' }]
    };
    try {
      const response = await axios.post(apiUrl, payload);
      const vendors = response.data.vendorResponseList || [];
      const categories = response.data.vendorCategoryTypeResponseList || [];
      const acquisitions = response.data.vendorAcquisitionTypeTypesResponseList || [];

      const enriched = vendors.map(vendor => ({
        ...vendor,
        vendorCategoryTypeResponseList: categories.filter(c => c.vendorID === vendor.vendorID),
        vendorAcquisitionTypeTypesResponseList: acquisitions.filter(a => a.vendorID === vendor.vendorID)
      }));

      setViewResults(enriched);
      setMessage(response.data.message || 'Vendors fetched.');
      setCurrentPage(1);
      clearForm();
    } catch (err) {
      setMessage('View failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const payload = {
      flag: 'DELETE',
      vendorID: deleteTarget.vendorID,
      vendorName: null,
      contactPerson: null,
      phone: null,
      address: null,
      vendorCategoryTypesVendor: [],
      vendorAcquisitionTypeTypeVendor: []
    };
    try {
      await axios.post(apiUrl, payload);
      setMessage('Vendor deleted.');
      setShowDeleteConfirm(false);
      handleView();
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
      VendorID: item.vendorID,
      VendorName: item.vendorName,
      ContactPerson: item.contactPerson,
      Phone: item.phone,
      Address: item.address,
      categoryType: item.vendorCategoryTypeResponseList?.map(c => c.categoryID) || [],
      acquisitionType: item.vendorAcquisitionTypeTypesResponseList?.map(a => a.acquisitionTypeID) || []
    });
    setEditMode(true);
  };

  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = viewResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(viewResults.length / resultsPerPage);

  return (
    <div className="vendor-container">
      <div className="vendor-form">
        <h2>Vendor Manager</h2>

        <input type="text" name="VendorID" placeholder="Vendor ID (auto)" value={form.VendorID} onChange={handleChange} disabled />
        <input type="text" name="VendorName" placeholder="Vendor Name" value={form.VendorName} onChange={handleChange} />
        <input type="text" name="ContactPerson" placeholder="Contact Person" value={form.ContactPerson} onChange={handleChange} />
        <input type="text" name="Phone" placeholder="Phone" value={form.Phone} onChange={handleChange} />
        <input type="text" name="Address" placeholder="Address" value={form.Address} onChange={handleChange} />

        <div className="category-section">
          <h3>Category Types</h3>
          <div className="checkbox-grid">
            <CategoryCheckboxes selected={form.categoryType} onToggle={handleCategoryChange} />
          </div>
          <p className="selection-count">Selected: {form.categoryType.length} categories</p>
        </div>

        <div className="acquisition-section">
          <h3>Acquisition Types</h3>
          <div className="checkbox-grid">
            <AcquisitionTypeCheckboxes selected={form.acquisitionType} onToggle={handleAcquisitionChange} />
          </div>
          <p className="selection-count">Selected: {form.acquisitionType.length} acquisition types</p>
        </div>

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
                <td>{item.vendorCategoryTypeResponseList?.map(c => c.categoryName).join(', ') || '—'}</td>
                <td>{item.vendorAcquisitionTypeTypesResponseList?.map(a => a.acquisitionTypeName).join(', ') || '—'}</td>
                <td>
                  <button onClick={() => populateFormForUpdate(item)} className="btn yellow">Edit</button>
                  <button onClick={() => confirmDelete(item)} className="btn red">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {viewResults.length > resultsPerPage && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Delete Vendor ID {deleteTarget?.vendorID}?</p>
            <button onClick={handleDelete} className="btn red">Yes, Delete</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn grey">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
