import React, { useState } from 'react';
import { updateExecutionDetails } from '../services/api';

const ExecutionEditPopup = ({ execution, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    actualWeightSent: execution.actualWeightSent || 0,
    actualWeightReceived: execution.actualWeightReceived || 0,
    dateReceived: execution.dateReceived || '',
    dateSent: execution.dateSent || '',   // ✅ Add dateSent field
    piecesReceived: execution.piecesReceived || 0,
    outWeight: execution.outWeight || 0,  // ✅ Add outWeight field
    status: execution.status,
  });
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const updatedData = { ...formData };
  
      await updateExecutionDetails(execution._id, updatedData);
      onSave({ ...execution, ...updatedData });  // ✅ Ensure data is passed correctly
      onClose(); // Close popup
    } catch (error) {
      console.error('❌ Error updating execution details:', error);
    }
  };
  

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Edit Execution Details</h3>

        <label>Actual Weight Sent:</label>
        <input type="number" name="actualWeightSent" value={formData.actualWeightSent} onChange={handleChange} />
        <label>Date Sent:</label>
<input type="date" name="dateSent" value={formData.dateSent} onChange={handleChange} />


        <label>Actual Weight Received:</label>
        <input type="number" name="actualWeightReceived" value={formData.actualWeightReceived} onChange={handleChange} />

        <label>Date Received:</label>
        <input type="date" name="dateReceived" value={formData.dateReceived} onChange={handleChange} />

        <label>Pieces Received:</label>
        <input type="number" name="piecesReceived" value={formData.piecesReceived} onChange={handleChange} />

        <label>Status:</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>

        <div className="popup-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionEditPopup;
