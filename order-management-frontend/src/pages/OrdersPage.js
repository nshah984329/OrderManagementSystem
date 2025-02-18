import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders, createOrder } from '../services/api';


const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(''); // Next available orderId
  const [newOrder, setNewOrder] = useState({ creator: '', responsible: '', company: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch orders and next order ID
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await fetchOrders();
        console.log('Fetched Orders:', data); // Debugging log
        setOrders(data.filter((order) => order && order.orderId)); // Filter invalid entries
      } catch (err) {
        setError('Failed to fetch orders.');
      }
    };

    const fetchNextOrderId = async () => {
      try {
        const { data } = await API.get('http://localhost:5045/api/orders/nextId');
        console.log('Fetched Next Order ID:', data.nextOrderId); // Debug log
        setNextOrderId(data.nextOrderId);
      } catch (err) {
        console.error('Failed to fetch next order ID:', err.message);
        setNextOrderId('Error fetching ID');
      }
    };

    loadOrders();
    fetchNextOrderId();
  }, []);

  useEffect(() => {
    console.log('Next Order ID Updated:', nextOrderId); // Debugging log
  }, [nextOrderId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const response = await createOrder(newOrder);
      console.log('Created Order:', response); // Debugging log
      setOrders((prev) => [...prev, response]);

      // Store the created orderId in local storage
      localStorage.setItem('currentOrderId', response.orderId);

      // Navigate to OrderDetailsPage
      navigate(`/orders/${response.orderId}`);
    } catch (err) {
      setError('Failed to create order.');
      console.error('Error in handleCreateOrder:', err.message); // Debugging log
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId}>
            <Link to={`/orders/${order.orderId}`}>{order.orderId}</Link> - {order.creator} - {order.responsible}
          </li>
        ))}
      </ul>

      <h2>Create Order</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateOrder();
        }}
      >
        <div>
          <label htmlFor="orderId">Next Order ID:</label>
          <input
            type="text"
            id="orderId"
            value={nextOrderId}
            readOnly // Make it uneditable
          />
        </div>
        <input
          type="text"
          name="creator"
          placeholder="Creator"
          value={newOrder.creator}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="responsible"
          placeholder="Responsible"
          value={newOrder.responsible}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={newOrder.company}
          onChange={handleInputChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrdersPage;
