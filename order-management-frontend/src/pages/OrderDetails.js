import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import { useCallback } from 'react';
import {
  fetchOrder,
  fetchLineItems,
  fetchProcesses,
  fetchVendors,
  fetchShapes,
  fetchGrades,
  createLineItem,
  editLineitem,
  deleteLineItem,
} from '../services/api';
import EditPopup from './EditPopup';



const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [fetchedLineItems, setfetchedLineItems] = useState([]);
  const [nextLineItemId, setNextLineItemId] = useState(''); // Next available lineItemId
  const [processes, setProcesses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [grades, setGrades] = useState([]);
  const allPossibleDimensions = ['length', 'breadth', 'thickness', 'diameter'];

  const shapeDimensionMap = {
    'Sheet': ['length', 'breadth', 'thickness'],
    'round bar': ['diameter', 'length'],
    'square bar': ['thickness', 'length'],
    'hexagon bar': ['thickness', 'length'],
    'flat bar': ['length', 'breadth', 'thickness'],
  };
  const [newLineItem, setNewLineItem] = useState({
    shape: '',
    grade: '',
    dimensions: { length: '', breadth: '', thickness: '', diameter: '' },
    quantity: '',
    weight: '',
    processIds: [],
    vendorIds: [],
  });
  const [density, setDensity] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const orderData = await fetchOrder(id);
        console.log('Fetched Order:', orderData);
        setOrder(orderData);

        const lineItemData = await fetchLineItems(id);
        console.log('Fetched Line Items:', lineItemData);
        setLineItems(lineItemData);
        setfetchedLineItems(lineItemData.data);
        const { data } = await axios.get(`https://munani.onrender.com/api/lineitems/nextLineItemId/${id}`);
        setNextLineItemId(data.nextLineItemId);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setMessage('Failed to load data.');
      }
    };
    loadOrderData();
  }, [id]);

  const fetchShapesOnClick = async () => {
    if (shapes.length > 0) return;
    try {
      const shapeData = await fetchShapes();
      setShapes(shapeData);
    } catch (err) {
      console.error('Error fetching shapes:', err.message);
    }
  };

  const fetchGradesOnClick = async () => {
    if (grades.length > 0) return;
    try {
      const gradeData = await fetchGrades();
      setGrades(gradeData);
    } catch (err) {
      console.error('Error fetching grades:', err.message);
    }
  };

  const fetchVendorsOnClick = async () => {
    if (vendors.length > 0) return;
    try {
      const vendorData = await fetchVendors();
      setVendors(vendorData);
    } catch (err) {
      console.error('Error fetching vendors:', err.message);
    }
  };

  const fetchProcessesOnClick = async () => {
    if (processes.length > 0) return;
    try {
      const processData = await fetchProcesses();
      setProcesses(processData);
    } catch (err) {
      console.error('Error fetching processes:', err.message);
    }
  };

  const fetchLineItemsForOrder = async () => {
    try {
      
      const lineItemData = await fetchLineItems(order.orderId);
      setfetchedLineItems(lineItemData.data);
      console.log("fetched Lineitems Again: ",fetchedLineItems);
    } catch (err) {
      console.error('Error fetching updated line items:', err.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate and log the dimensions
    const { dimensions } = newLineItem;
    console.log('Submitting Dimensions:', dimensions);
    const updatedDimensions = {};
    allPossibleDimensions.forEach((dimension) => {
      updatedDimensions[dimension] = dimensions[dimension] || null;
    });
    // Check if all dimensions are numbers or null
    const allValid = Object.values(updatedDimensions).every(
      (value) => value === null || typeof value === 'number'
    );
  
    if (!allValid) {
      console.error('Invalid dimensions:', updatedDimensions);
      setMessage('Please provide valid numeric dimensions.');
      return;
    }
  
    console.log('Submitting Line Item:', { ...newLineItem, orderId: id, lineItemId: nextLineItemId,dimensions:updatedDimensions });
  
    try {
      const response = await createLineItem({ ...newLineItem, orderId: id, lineItemId: nextLineItemId ,dimensions:updatedDimensions });
      console.log('Line Item Created:', response);
  
      setMessage('Line item added successfully!');
      fetchLineItemsForOrder();
      
      setLineItems((prev) => (Array.isArray(prev) ? [...prev, response] : [response]));
      setNewLineItem({
        shape: '',
        grade: '',
        dimensions: { length: updatedDimensions.length, breadth: updatedDimensions.breadth, thickness: updatedDimensions.thickness, diameter: updatedDimensions.diameter },
        quantity: '',
        weight: '',
        processIds: [],
        vendorIds: [],
      });
      const lineItemData = await fetchLineItems(id);
      setLineItems(lineItemData);
      // Fetch next lineItemId for subsequent additions
      const { data } = await axios.get(`https://munani.onrender.com/api/lineitems/nextLineItemId/${id}`);
      setNextLineItemId(data.nextLineItemId);
    } catch (err) {
      console.error('Failed to add line item:', err.response?.data || err.message);
      setMessage('Failed to add line item.');
    }
  };


  const calculateWeight = useCallback(() => {
    const { shape, dimensions, quantity } = newLineItem;
    const { length, breadth, thickness, diameter } = dimensions;
  
    if (!shape || !density || !quantity || quantity <= 0) {
      return { totalWeight: '', weightPerUnit: '' }; // Return empty if missing key data
    }
  
    let volume = 0;
  
    if (shape === 'round bar') {
      if (diameter && length) {
        volume = Math.PI * Math.pow(diameter / 2, 2) * length; // Volume of a cylinder
      }
    } else if (shape === 'Sheet' || shape === 'flat bar') {
      if (length && breadth && thickness) {
        volume = length * breadth * thickness; // Volume of a rectangular block
      }
    } else if (shape === 'square bar') {
      if (thickness && length) {
        volume = Math.pow(thickness, 2) * length; // Volume of a square cross-section bar
      }
    } else if (shape === 'hexagon bar') {
      if (thickness && length) {
        const area = (3 * Math.sqrt(3) * Math.pow(thickness / 2, 2)) / 2; // Area of hexagon
        volume = area * length; // Volume of hexagonal prism
      }
    }
  
    const totalWeight = volume * density * quantity*0.000001; // Multiply by quantity
    const weightPerUnit = totalWeight / quantity; // Divide totalWeight by quantity
  
    return {
      totalWeight: isNaN(totalWeight) ? '' : totalWeight.toFixed(2),
      weightPerUnit: isNaN(weightPerUnit) ? '' : weightPerUnit.toFixed(2),
    };
  }, [newLineItem, density]); // Dependencies for useCallback
  
  
  
  const fetchDensity = async (selectedGrade) => {
    const grade = grades.find((g) => g.grade === selectedGrade);
    return grade ? grade.density : 0; // Return 0 if no matching grade
  };
  
  const handleDropdownChange = async (e) => {
    const { name, value } = e.target;
  
    if (name === 'grade') {
      const fetchedDensity = await fetchDensity(value);
      setDensity(fetchedDensity);
      setNewLineItem((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewLineItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  

const [editingLineItem, setEditingLineItem] = useState(null); // Line item to edit
const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Whether popup is open

const handleEditLineItem = (item) => {
  setEditingLineItem(item); // Set the line item being edited
  setIsEditPopupOpen(true); // Open the popup
};
const handleDeleteLineItem = async (lineItemId) => {
  try {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this line item?')) {
      return; // Exit if user cancels
    }

    // Call the delete API
    const response = await deleteLineItem(encodeURIComponent(lineItemId));
    console.log('Line Item Deleted:', response.data);

    // Refresh the list of line items after deletion
    await fetchLineItemsForOrder();
    
    // Show success message
    setMessage(`✅ Line item ${lineItemId} deleted successfully!`);
  } catch (err) {
    console.error('❌ Error deleting line item:', err.response?.data || err.message);
    setMessage('❌ Failed to delete line item.');
  }
};



const handleUpdateLineItem = async (updatedLineItem) => {
  try {
    console.log('Update button clicked:', updatedLineItem);

    // Validate data
    if (
      !Array.isArray(updatedLineItem.processIds) ||
      !Array.isArray(updatedLineItem.vendorIds)
    ) {
      throw new Error('processIds and vendorIds must be arrays.');
    }

    console.log('processIds:', updatedLineItem.processIds);
    console.log('vendorIds:', updatedLineItem.vendorIds);

    // Encode the lineItemId once
    const encodedLineItemId = encodeURIComponent(updatedLineItem.lineItemId);
    console.log('Encoded Line Item ID:', encodedLineItemId);

    const response = await editLineitem(encodedLineItemId, {
      processIds: updatedLineItem.processIds,
      vendorIds: updatedLineItem.vendorIds,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Updated Line Item:', response.data);

    // Refresh the line items
    fetchLineItemsForOrder();
    setIsEditPopupOpen(false); // Close the popup
  } catch (err) {
    console.error('Error updating line item:', err.response?.data || err.message);
  }
};



useEffect(() => {
  console.log('Shape:', newLineItem.shape);
  console.log('Grade:', newLineItem.grade);
  console.log('Dimensions:', newLineItem.dimensions);
  console.log('Density:', density);
  if (newLineItem.shape || newLineItem.grade || Object.values(newLineItem.dimensions).some((val) => val)) {
    setNewLineItem((prev) => ({ ...prev, weight: calculateWeight() }));
  }
}, [newLineItem.shape, newLineItem.grade, newLineItem.dimensions]);
useEffect(() => {
  const { totalWeight, weightPerUnit } = calculateWeight();
  setNewLineItem((prev) => ({
    ...prev,
    weight: totalWeight, // Update total weight in the state
    weightPerUnit, // Update weight per unit in the state
  }));
}, [newLineItem.shape, newLineItem.dimensions, newLineItem.quantity, density, calculateWeight]);



useEffect(() => {

  console.log('Updated fetchedLineItems:', fetchedLineItems.data);
  console.log('Fetched Line Items:', fetchedLineItems);
console.log('Is Array:', Array.isArray(fetchedLineItems));
console.log('Length:', fetchedLineItems);

}, [fetchedLineItems]); // This will log whenever `fetchedLineItems` changes

const handleShapeChange = (e) => {
  const selectedShape = e.target.value;
  setNewLineItem((prev) => ({
    ...prev,
    shape: selectedShape,
    dimensions: { length: '', breadth: '', thickness: '', diameter: '' }, // Reset dimensions
    weight: '', // Clear weight
  }));
};


  const renderDimensionFields = () => {
    const selectedShape = newLineItem.shape;
    const dimensionsToRender = shapeDimensionMap[selectedShape] || [];

    return (
      <div className='textbox-container'>
        {dimensionsToRender.map((dimension) => (
          <input
            key={dimension}
            type="number"
            name={dimension}
            placeholder={dimension.charAt(0).toUpperCase() + dimension.slice(1)}
            value={newLineItem.dimensions[dimension] || ''}
            onChange={(e) =>
              setNewLineItem((prev) => ({
                ...prev,
                dimensions: {
                  ...prev.dimensions,
                  [dimension]: parseFloat(e.target.value) || null,
                },
              }))
            }
            required
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1>Order Details</h1>
      {order && (
        <div>
          <p>Order ID: {order.orderId}</p>
          <p>Creator: {order.creator}</p>
        </div>
      )}

      <h2>Add New Line Item</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="lineItemId">Next Line Item ID:</label>
          <input type="text" id="lineItemId" value={nextLineItemId} readOnly />
        </div>

        {/* Shape Selection */}
        <select
          name="shape"
          value={newLineItem.shape}
          onChange={handleShapeChange}
          onClick={fetchShapesOnClick}
        >
          <option value="">Select Shape</option>
          {Array.isArray(shapes) && shapes.length > 0 ? (
            shapes.map((shape) => (
              <option key={shape._id} value={shape.shapeId}>
                {shape.shapeId}
              </option>
            ))
          ) : (
            <option disabled>No shapes available</option>
          )}
        </select>

        <select
          name="grade"
          value={newLineItem.grade}
          onChange={handleDropdownChange}
          onClick={fetchGradesOnClick}
        >
          <option value="">Select Grade</option>
          {Array.isArray(grades) && grades.length > 0 ? (
            grades.map((grade) => (
              <option key={grade._id} value={grade.grade}>
                {grade.grade}
              </option>
            ))
          ) : (
            <option disabled>No grades available</option>
          )}
        </select>

        {/* Dynamic Dimension Fields */}
        {renderDimensionFields()}

        <input
          type="number"
          placeholder="Quantity"
          value={newLineItem.quantity}
          onChange={(e) =>
            setNewLineItem((prev) => ({ ...prev, quantity: e.target.value }))
          }
          required
        />

<input
          type="hidden"
          placeholder="Weight"
          value={newLineItem.weight} // Dynamically updated weight
          readOnly
          
          required
        /> 
  <input
    type="number"
    placeholder="Total Weight"
    value={newLineItem.weight || ''} // Dynamically updated weight
    readOnly
    required
  />

  {/* Weight Per Unit (Read-Only) */}
  <input
    type="number"
    placeholder="Weight Per Unit"
    value={newLineItem.weightPerUnit || ''} // Dynamically updated weight per unit
    readOnly
  />

<select
  name="processIds"
  value={newLineItem.processIds[0] || ''}
  onChange={(e) =>
    setNewLineItem((prev) => ({
      ...prev,
      processIds: [e.target.value], // Set the first selected process
    }))
  }
  onClick={fetchProcessesOnClick}
>
  <option value="">Select Process</option>
  {Array.isArray(processes) && processes.length > 0 ? (
    processes.map((process) => (
      <option key={process._id} value={process.processId}>
        {process.processId}
      </option>
    ))
  ) : (
    <option disabled>No processes available</option>
  )}
</select>

<select
  name="vendorIds"
  value={newLineItem.vendorIds[0] || ''}
  onChange={(e) =>
    setNewLineItem((prev) => ({
      ...prev,
      vendorIds: [e.target.value], // Set the first selected vendor
    }))
  }
  onClick={fetchVendorsOnClick}
>
  <option value="">Select Vendor</option>
  {Array.isArray(vendors) && vendors.length > 0 ? (
    vendors.map((vendor) => (
      <option key={vendor._id} value={vendor.vendorId}>
        {vendor.vendorId}
      </option>
    ))
  ) : (
    <option disabled>No vendors available</option>
  )}
</select>


        <button type="submit">Add Line Item</button>
      </form>
      {message && <p>{message}</p>}

      <h2>Existing Line Items</h2>
      
      {fetchedLineItems.length > 0 ? (
        <div className="table-container">
        <table className="responsive-table">
          
          <thead>
            <tr>
              <th>Line Item ID</th>
              <th>Shape</th>
              <th>Grade</th>
              <th>Dimensions</th>
              <th>Quantity</th>
              <th>Weight</th>
              <th>Processes</th>
              <th>Vendors</th>
            </tr>
          </thead>
          <tbody>
            {fetchedLineItems.map((item, index) => (
              <tr key={index}>
                <td>{item.lineItemId || 'Unknown'}</td>
                <td>{item.shape || 'N/A'}</td>
                <td>{item.grade || 'N/A'}</td>
          {/* Dimensions with comma separator */}
          <td>
            {item.dimensions
              ? Object.entries(item.dimensions)
                  .filter(([_, value]) => value && value !== 'N/A')
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')
              : 'N/A'}
          </td>

          <td>{item.quantity ? `${item.quantity} nos` : 'N/A'}</td>
<td>{item.weight ? `${item.weight} kg` : 'N/A'}</td>



          {/* Processes with comma separator */}
          <td>
            {Array.isArray(item.processIds) && item.processIds.length > 0
              ? item.processIds.join(', ')
              : 'N/A'}
          </td>

          {/* Vendors with comma separator */}
          <td>
            {Array.isArray(item.vendorIds) && item.vendorIds.length > 0
              ? item.vendorIds.join(', ')
              : 'N/A'}
          </td>
          <td className="action-buttons">
  <button className="edit-btn" onClick={() => handleEditLineItem(item)}>Edit</button>
  <button className="delete-btn" onClick={() => handleDeleteLineItem(item.lineItemId)}>Delete</button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <p>No line items available</p>
      )}
      {isEditPopupOpen && editingLineItem && (
  <EditPopup
    lineItem={editingLineItem}
    onClose={() => setIsEditPopupOpen(false)}
    onSave={(updatedLineItem) => {
      console.log('Save clicked with:', updatedLineItem);
      handleUpdateLineItem(updatedLineItem); // Update the line item
    }}
  />
)}
    </div>
  );
};


export default OrderDetails;
