import React, { useState, useEffect } from 'react';

const AcquisitionTypeCheckboxes = ({ selected, onToggle }) => {
  const [acquisitionTypes, setAcquisitionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        if (data.acquisitionTypeResponse && data.acquisitionTypeResponse.length > 0) {
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

  if (loading) return <div>Loading acquisition types...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {acquisitionTypes.map(({ acquisitionTypeID, acquisitionTypeName, status }) => (
        <label key={acquisitionTypeID} style={{ display: 'block', marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={selected.includes(acquisitionTypeID)}
            onChange={() => onToggle(acquisitionTypeID)}
          />
          {acquisitionTypeName} ({status})
        </label>
      ))}
    </div>
  );
};

export default AcquisitionTypeCheckboxes;
