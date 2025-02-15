import React, { useState, useEffect } from 'react';
import { fetchLineItemDetails } from '../services/api';

const LineItemDetailPopup = ({ lineItemId, onClose }) => {
  const [lineItem, setLineItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchLineItemDetails(lineItemId);
        setLineItem(data);
      } catch (error) {
        console.error('Error loading line item details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lineItemId) fetchDetails();
  }, [lineItemId]);

  // Function to extract non-null dimensions
  const renderDimensions = () => {
    if (!lineItem?.dimensions) return null;

    const dimensionEntries = Object.entries(lineItem.dimensions)
      .filter(([_, value]) => value !== null) // Filter out null values
      .map(([key, value]) => (
        <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
      ));

    return dimensionEntries.length > 0 ? dimensionEntries : <p>No dimensions available</p>;
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Line Item Details</h2>
        {loading ? (
          <p>Loading...</p>
        ) : lineItem ? (
          <div>
            <p><strong>Line Item ID:</strong> {lineItem.lineItemId}</p>
            <p><strong>Shape:</strong> {lineItem.shape}</p>
            <p><strong>Grade:</strong> {lineItem.grade}</p>
            <p><strong>Weight:</strong> {lineItem.weight}</p>

            {/* Render only non-null dimensions */}
            <h3>Dimensions</h3>
            {renderDimensions()}

            <p><strong>Processes:</strong> {lineItem.processIds.length > 0 ? lineItem.processIds.join(', ') : 'N/A'}</p>
            <p><strong>Vendors:</strong> {lineItem.vendorIds.length > 0 ? lineItem.vendorIds.join(', ') : 'N/A'}</p>
          </div>
        ) : (
          <p>Line item not found.</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LineItemDetailPopup;
