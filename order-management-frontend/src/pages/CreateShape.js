import React, { useState } from 'react';
import { createShape } from '../services/api';

const CreateShape = () => {
  const [shape, setShape] = useState({ shapeId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // To track error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShape((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset messages
    setError('');

    try {
      await createShape(shape);
      setMessage('Shape created successfully!');
      setShape({ shapeId: '' });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Check for duplicate error message from the backend
        setError(err.response.data.message || 'Failed to create shape due to duplicate ID.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Create Shape</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="shapeId"
          placeholder="Shape ID"
          value={shape.shapeId}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Shape</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateShape;
