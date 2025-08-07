import React, { useState, useEffect, useRef } from 'react';
import '../AcquisitionType/AcquisitionTypeCheckboxes.css';

const AcquisitionTypeCheckboxDropdown = ({ selected, onToggle }) => {
  const [acquisitionTypes, setAcquisitionTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dropdownRef = useRef();

  useEffect(() => {
    async function fetchAcquisitionTypes() {
      try {
        const response = await fetch('https://localhost:7270/api/Master/AquisitionType', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flag: 'VIEW',
            acquisitionTypeID: null,
            acquisitionTypeName: null,
            status: null,
          }),
        });

        const data = await response.json();
        if (data.acquisitionTypeResponse?.length > 0) {
          setAcquisitionTypes(data.acquisitionTypeResponse);
        } else {
          setError('No acquisition types found.');
        }
      } catch (err) {
        setError('Error fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAcquisitionTypes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const getSelectedNames = () => {
    return acquisitionTypes
      .filter((item) => selected.includes(item.acquisitionTypeID))
      .map((item) => item.acquisitionTypeName)
      .join(', ') || 'Select Acquisition Types';
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div className="dropdown-header" onClick={toggleDropdown}>
        {getSelectedNames()}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="dropdown-list">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && acquisitionTypes.map(({ acquisitionTypeID, acquisitionTypeName, status }) => (
            <label key={acquisitionTypeID} className="checkbox-item">
              <input
                type="checkbox"
                checked={selected.includes(acquisitionTypeID)}
                onChange={() => onToggle(acquisitionTypeID)}
              />
              {acquisitionTypeName} ({status})
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcquisitionTypeCheckboxDropdown;
