import React, { useState, useEffect } from 'react';
import { createVendor, fetchVendors, fetchProcesses, createVendorProcess, fetchVendorProcesses, deleteVendorProcess, updateVendor } from '../services/api';

const VendorManager = () => {
  const [isEditing, setIsEditing] = useState(false); // Track if editing or creating
  const [vendors, setVendors] = useState([]); // List of all vendors
  const [vendor, setVendor] = useState({ vendorId: '', contact: '', location: '' }); // Current vendor details
  const [message, setMessage] = useState('');
  const [processes, setProcesses] = useState([]); // List of all processes
  const [linkedProcesses, setLinkedProcesses] = useState([]); // Processes linked to the selected vendor
  const [selectedProcesses, setSelectedProcesses] = useState([]); // Processes being added/removed

  // Fetch initial data (vendors and processes)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vendorData, processData] = await Promise.all([fetchVendors(), fetchProcesses()]);
        setVendors(vendorData);
        setProcesses(processData);
      } catch (err) {
        console.error('Error loading initial data:', err.message);
      }
    };
    loadInitialData();
  }, []);

  const handleVendorSelection = async (e) => {
    const vendorId = e.target.value; // Selected vendorId
    if (!vendorId) {
      setVendor({ vendorId: '', contact: '', location: '' });
      setLinkedProcesses([]);
      setSelectedProcesses([]);
      setIsEditing(false);
      return;
    }

    try {
      const selectedVendor = vendors.find((v) => v.vendorId === vendorId);
      setVendor(selectedVendor);
      setIsEditing(true);

      // Fetch linked processes
      const vendorProcesses = await fetchVendorProcesses(vendorId);

      if (vendorProcesses.length === 0) {
        console.log('No processes linked to this vendor yet.');
      }

      const linked = vendorProcesses.map((vp) => vp.processId);
      setLinkedProcesses(linked);
      setSelectedProcesses(linked); // Pre-select linked processes
    } catch (err) {
      console.error('Error fetching vendor processes:', err.message);
    }
  };

  const handleProcessSelection = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedProcesses((prev) => [...prev, value]);
    } else {
      setSelectedProcesses((prev) => prev.filter((processId) => processId !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let vendorId;

      if (isEditing) {
        // Update vendor details if editing
        const updatedVendor = await updateVendor(vendor.vendorId, vendor); // Pass vendorId for updates
        vendorId = updatedVendor.vendorId;
      } else {
        // Create a new vendor if not editing
        const createdVendor = await createVendor(vendor);
        vendorId = createdVendor.vendorId;
      }

      // Update VendorProcesses
      const processesToAdd = selectedProcesses.filter((p) => !linkedProcesses.includes(p));
      const processesToRemove = linkedProcesses.filter((p) => !selectedProcesses.includes(p));

      // Add new processes
      const addPromises = processesToAdd.map((processId) =>
        createVendorProcess({ vendorId, processId })
      );
      await Promise.all(addPromises);

      // Remove old processes
      const removePromises = processesToRemove.map((processId) =>
        deleteVendorProcess({ vendorId, processId })
      );
      await Promise.all(removePromises);

      setMessage('Vendor and processes updated successfully!');
      setVendors(await fetchVendors()); // Refresh vendor list
      setLinkedProcesses(selectedProcesses); // Sync updated processes
    } catch (err) {
      console.error('Error updating vendor or processes:', err.message);
      setMessage('Failed to update vendor or processes.');
    }
  };

  return (
    <div>
      <h1>{isEditing ? 'Edit Vendor' : 'Create Vendor'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Vendor (for Editing):</label>
          <select value={vendor.vendorId || ''} onChange={handleVendorSelection}>
            <option value="">Create New Vendor</option>
            {vendors.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {decodeURIComponent(v.vendorId)} - {v.contact}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          name="vendorId"
          placeholder="Vendor ID"
          value={vendor.vendorId}
          onChange={(e) => setVendor((prev) => ({ ...prev, vendorId: e.target.value }))}
          required
          disabled={isEditing} // Disable vendorId editing for existing vendors
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact"
          value={vendor.contact}
          onChange={(e) => setVendor((prev) => ({ ...prev, contact: e.target.value }))}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={vendor.location}
          onChange={(e) => setVendor((prev) => ({ ...prev, location: e.target.value }))}
        />
        <div>
          <h3>Manage Processes</h3>
          {processes.map((process) => (
            <div key={process.processId}>
              <input
                type="checkbox"
                id={process.processId}
                value={process.processId}
                checked={selectedProcesses.includes(process.processId)}
                onChange={handleProcessSelection}
              />
              <label htmlFor={process.processId}>{process.processId}</label>
            </div>
          ))}
        </div>
        <button type="submit">{isEditing ? 'Update Vendor' : 'Create Vendor'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VendorManager;
