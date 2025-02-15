import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import OrdersPage from './pages/OrdersPage';
import OrderDetails from './pages/OrderDetails';
import CreateVendor from './pages/CreateVendor';
import CreateProcess from './pages/CreateProcess';
import CreateShape from './pages/CreateShape';
import CreateGrade from './pages/CreateGrade';
import ExecutionDetailsPage from './pages/ExecutionDetails'; // ✅ NEW IMPORT
import LineItemDetailPopup from './pages/LineItemDetailPopup';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>An error occurred. Please check your setup.</div>;
    }
    return this.props.children;
  }
}

// HomePage Component
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1>Welcome to the Order Management System</h1>
    <p>Manage your orders, shapes, grades, processes, and vendors efficiently.</p>
    <div>
      <Link to="/orders" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Go to Orders
      </Link>
      <Link to="/execution-details" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Execution Management
      </Link>
      <Link to="/create-shape" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Add Shape
      </Link>
      <Link to="/create-grade" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Add Grade
      </Link>
      <Link to="/create-vendor" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Add Vendor
      </Link>
      <Link to="/create-process" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
        Add Process
      </Link>
    </div>
  </div>
);

// App Component
const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <header style={{ padding: '10px', backgroundColor: '#f4f4f4', textAlign: 'center' }}>
          <h1>Order Management</h1>
          <nav>
            <Link to="/" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Home
            </Link>
            <Link to="/orders" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Orders
            </Link>
            <Link to="/execution-details" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Execution Management
            </Link>
            <Link to="/create-shape" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Add Shape
            </Link>
            <Link to="/create-grade" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Add Grade
            </Link>
            <Link to="/create-vendor" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Add Vendor
            </Link>
            <Link to="/create-process" style={{ margin: '10px', textDecoration: 'none', color: 'blue' }}>
              Add Process
            </Link>
          </nav>
        </header>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/execution-details" element={<ExecutionDetailsPage />} /> {/* ✅ NEW ROUTE */}
            <Route path="/create-vendor" element={<CreateVendor />} />
            <Route path="/create-process" element={<CreateProcess />} />
            <Route path="/create-shape" element={<CreateShape />} />
            <Route path="/create-grade" element={<CreateGrade />} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f4f4f4' }}>
          <p>&copy; 2024 Order Management System</p>
        </footer>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
