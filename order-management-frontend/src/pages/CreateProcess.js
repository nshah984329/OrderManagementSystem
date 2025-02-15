// File: src/pages/CreateProcess.js
import React, { useState } from 'react';
import { createProcess } from '../services/api';

const CreateProcess = () => {
  const [process, setProcess] = useState({ processId: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcess((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProcess(process);
      setMessage('Process created successfully!');
      setProcess({ processId: '' });
    } catch (err) {
      setMessage('Failed to create process.');
    }
  };

  return (
    <div>
      <h1>Create Process</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="processId"
          placeholder="Process ID"
          value={process.processId}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Process</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateProcess;
