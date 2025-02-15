import React, { useState, useEffect } from 'react';
import { fetchVendors, fetchProcesses, fetchVendorProcesses, addVendorProcess, deleteVendorProcess } from '../services/api';

const VendorProcessManager = () => {
  const [vendors, setVendors] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [vendorProcesses, setVendorProcesses] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [message, setMessage] = useState('');

  // Fetch vendors, processes, and existing vendor-process links
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vendorData, processData, vendorProcessData] = await Promise.all([
          fetchVendors(),
          fetchProcesses(),
          fetchVendorProcesses(),
        ]);
        setVendors(vendorData);
        setProcesses(processData);
        setVendorProcesses(vendorProcessData);
      } catch (err) {
        console.error('Error loading data:', err.message);
      }
    };
    loadInitialData();
  }, []);

  const handleAddLink = async () => {
    if (!selectedVendor || !selectedProcess) {
      setMessage('Please select both a vendor and a process.');
      return;
    }
    try {
      const newLink = { vendorId: selectedVendor, processId: selectedProcess };
      await addVendorProcess(newLink);
      setMessage('Vendor-Process link added successfully!');
      // Fetch updated list
      const updatedLinks = await fetchVendorProcesses();
      setVendorProcesses(updatedLinks);
      setSelectedVendor('');
      setSelectedProcess('');
    } catch (err) {
      console.error('Error adding vendor-process link:', err.message);
      setMessage('Failed to add vendor-process link.');
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await deleteVendorProcess(id);
      setMessage('Vendor-Process link deleted successfully!');
      // Fetch updated list
      const updatedLinks = await fetchVendorProcesses();
      setVendorProcesses(updatedLinks);
    } catch (err) {
      console.error('Error deleting vendor-process link:', err.message);
      setMessage('Failed to delete vendor-process link.');
    }
  };

  return (
    <div>
      <h1>Manage Vendor-Process Links</h1>
      <div>
        <h3>Add New Link</h3>
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor._id} value={vendor.vendorId}>
              {vendor.name}
            </option>
          ))}
        </select>
        <select
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select Process</option>
          {processes.map((process) => (
            <option key={process._id} value={process.processId}>
              {process.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddLink} style={{ padding: '5px 10px', background: 'blue', color: 'white' }}>
          Add Link
        </button>
      </div>

      {message && <p>{message}</p>}

      <h3>Existing Links</h3>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Process</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorProcesses.map((link) => (
            <tr key={link._id}>
              <td>{link.vendorId}</td>
              <td>{link.processId}</td>
              <td>
                <button
                  onClick={() => handleDeleteLink(link._id)}
                  style={{ color: 'red', border: 'none', background: 'none' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorProcessManager;
