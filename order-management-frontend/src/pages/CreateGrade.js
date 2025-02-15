// File: src/pages/CreateGrade.js
import React, { useState } from 'react';
import { createGrade } from '../services/api';

const CreateGrade = () => {
  const [grade, setGrade] = useState({ grade: '', density: '', chemicalComposition: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGrade((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGrade(grade);
      setMessage('Grade created successfully!');
      setGrade({ grade: '', density: '', chemicalComposition: '' });
    } catch (err) {
      setMessage('Failed to create grade.');
    }
  };

  return (
    <div>
      <h1>Create Grade</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="grade"
          placeholder="Grade"
          value={grade.grade}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="density"
          placeholder="Density"
          value={grade.density}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="chemicalComposition"
          placeholder="Chemical Composition"
          value={grade.chemicalComposition}
          onChange={handleChange}
        />
        <button type="submit">Create Grade</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateGrade;