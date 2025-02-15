import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to the Order Management System</h1>
      <p>
        Manage orders, line items, processes, and vendors effectively with our system.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/orders" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
          Go to Orders
        </Link>
        <Link to="/lineitems" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
          View Line Items
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
