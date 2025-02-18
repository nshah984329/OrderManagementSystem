// File: src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://munani.onrender.com/api',
});

// Orders
export const fetchOrders = () => API.get('/orders');

export const createOrder = async (order) => {
  try {
    const response = await API.post('/orders', {
      creator: order.creator,
      responsible: order.responsible,
      company: order.company,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('orderId is required to fetch an order');
    }
    const response = await API.get(`/orders/${orderId}`);
    console.log('Order API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order from API:', error.response?.data || error.message);
    throw error;
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    const response = await API.put(`/orders/${orderId}`, updates);
    console.log('Updated Order API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await API.delete(`/orders/${orderId}`);
    console.log('Deleted Order API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchNextOrderId = async () => {
  try {
    const response = await API.get('/orders/nextId');
    console.log('Next Order ID API response:', response.data);
    return response.data.nextOrderId;
  } catch (error) {
    console.error('Error fetching next order ID:', error.response?.data || error.message);
    throw error;
  }
};

// Line Items
export const fetchLineItems = (orderId) => API.get(`/lineitems/orders/${orderId}`);
export const fetchLineItemDetails = async (lineItemId) => {
  try {
    const encodedId = encodeURIComponent(lineItemId);
    const response = await API.get(`/lineitems/${encodedId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching line item details:', error.response?.data || error.message);
    throw error;
  }
};

export const createLineItem = async (lineItem) => {
  try {
    const response = await API.post('/lineitems', lineItem);
    return response.data;
  } catch (error) {
    console.error('Error creating line item:', error.response?.data || error.message);
    throw error;
  }
};

export const editLineitem = (lineItemId, data) => API.put(`/lineitems/${lineItemId}`, data);

export const deleteLineItem = async (lineItemId) => {
  try {
    const encodedId = lineItemId; // Ensure encoding
    const response = await API.delete(`/lineitems/${encodedId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting line item:', error.response?.data || error.message);
    throw error;
  }
};


// Processes
export const fetchProcesses = async () => {
  try {
    const response = await API.get('/processes');
    console.log('Processes API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes from API:', error.response?.data || error.message);
    throw error;
  }
};

export const createProcess = (process) => API.post('/processes', process);

// Vendors
export const fetchVendors = async () => {
  try {
    const response = await API.get('/vendors');
    console.log('Vendors API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors from API:', error.response?.data || error.message);
    throw error;
  }
};

export const createVendor = async (vendor) => {
  try {
    const response = await API.post('/vendors', vendor);
    console.log('createVendor response:', response.data); // Log the response
    return response.data; // Return the response
  } catch (error) {
    console.error('Error creating vendor:', error.response?.data || error.message);
    throw error;
  }
};


// Shapes
export const fetchShapes = async () => {
  try {
    const response = await API.get('/shapes');
    console.log('Shapes API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching shapes from API:', error.response?.data || error.message);
    throw error;
  }
};

export const createShape = (shape) => API.post('/shapes', shape);

// Grades
export const fetchGrades = async () => {
  try {
    const response = await API.get('/grades');
    console.log('Grades API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching grades from API:', error.response?.data || error.message);
    throw error;
  }
};

export const createGrade = (grade) => API.post('/grades', grade);

export const createLineItemProcess = async (lineItemProcess) => {
  const response = await API.post('/lineitemprocesses', lineItemProcess);
  return response.data;
};

// Fetch processes for a specific LineItem
export const fetchLineItemProcesses = async (lineItemId) => {
  try {
    const encodedId = encodeURIComponent(lineItemId);
    console.log('Fetching line item processes for:', encodedId);

    const response = await API.get(`/lineitemprocesses/${encodedId}`);
    const processes = response.data.map((process, index) => ({
      ...process,
      _id: process._id || `fallback-${index}`,
      sequence: process.sequence || index + 1,
      processId: process.processId || 'N/A',
      vendorId: process.vendorId || 'N/A',
    }));

    console.log('Fetched and processed line item processes:', processes);
    return processes;
  } catch (error) {
    console.error('Error fetching line item processes:', error.message);
    throw error;
  }
};


// Reorder LineItemProcesses
export const reorderLineItemProcesses = async (lineItemId, reorderedProcesses) => {
  const encodedId = encodeURIComponent(lineItemId); // Encode the ID
  const response = await API.put(`/lineitemprocesses/reorder/${encodedId}`, { reorderedProcesses });
  return response.data;
};

// Update a specific LineItemProcess
export const updateLineItemProcess = async (lineItemProcessId, updates) => {
  const encodedId = encodeURIComponent(lineItemProcessId); // Encode the ID
  const response = await API.put(`/lineitemprocesses/${encodedId}`, updates);
  return response.data;
};

// Delete a specific LineItemProcess
export const deleteLineItemProcess = async (lineItemProcessId) => {
  const encodedId = encodeURIComponent(lineItemProcessId); // Encode the ID
  const response = await API.delete(`/lineitemprocesses/${encodedId}`);
  return response.data;
};

export const createVendorProcess = (vendorProcess) => API.post('/vendorProcesses', vendorProcess);

// VendorProcesses
export const fetchVendorProcesses = async (vendorId) => {
  try {
    const encodedVendorId = encodeURIComponent(vendorId); // Encode vendorId
    const response = await API.get(`/vendorprocesses/${encodedVendorId}`);
    
    if (response.data.vendorProcesses && response.data.vendorProcesses.length === 0) {
      console.log(response.data.message); // Log the "No processes linked" message
    }

    return response.data.vendorProcesses || []; // Return an empty array if no processes are found
  } catch (error) {
    console.error('Error fetching vendor processes:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchAllVendorProcesses = async () => {
  try {
    const response = await API.get(`/vendorprocesses`);
    console.log('fetchAllVendorProcesses Response:', response.data); // DEBUG LOG

    //if (!response.ok) throw new Error('Failed to fetch vendor processes');
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor processes:', error);
    return [];
  }
};




export const updateVendor = async (id, updates) => {
  try {
    const response = await API.put(`/vendors/${id}`, updates);
    console.log('Updated vendor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating vendor:', error.response?.data || error.message);
    throw error;
  }
};



export const deleteVendorProcess = async (vendorProcess) => {
  try {
    const response = await API.delete('/vendorprocesses', { data: vendorProcess });
    console.log('Deleted vendor process:', response.data);
    return response.data; // Return success message
  } catch (error) {
    console.error('Error deleting vendor process:', error.response?.data || error.message);
    throw error;
  }
};
// ================= Execution Details APIs =================

// 1. Fetch Execution Details Grouped by Process-Vendor
export const fetchExecutionDetailsGrouped = async () => {
  try {
    const response = await API.get('/executiondetails/grouped');
    
    if (!Array.isArray(response.data)) {
      console.warn("⚠️ Unexpected response format from /executiondetails/grouped:", response.data);
      return [];
    }
    
    console.log('✅ Execution Details (Grouped):', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching execution details (grouped):', error.response?.data || error.message);
    return []; // Ensure we return an empty array instead of throwing an error
  }
};


// 2. Create Execution Details (Multiple Line Items under a Process-Vendor)
export const addExecutionDetails = async (executionData) => {
  try {
    // ✅ Validate required fields
    const requiredFields = ['lineItemId', 'orderId', 'processId', 'vendorId', 'outWeight', 'dateSent', 'piecesSent'];
    const missingFields = requiredFields.filter(field => !executionData[field]);

    if (missingFields.length > 0) {
      console.error("🚨 Missing required fields:", missingFields);
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }

    // ✅ Ensure processId & vendorId are strings
    executionData.processId = String(executionData.processId);
    executionData.vendorId = String(executionData.vendorId);

    console.log("✅ Sending Execution Details:", executionData);

    const response = await API.post('/executiondetails', executionData);
    console.log('✅ Execution Details Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding execution details:', error.response?.data || error.message);
    throw error;
  }
};




// 3. Update Execution Details (Received Materials & Status)
export const updateExecutionDetails = async (executionId, updateData) => {
  try {
    if (!executionId || typeof executionId !== 'string') {
      throw new Error("Invalid execution ID provided");
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error("Invalid update data provided");
    }

    console.log(`🔄 Updating Execution ${executionId}:`, updateData);

    const response = await API.put(`/executiondetails/${executionId}`, updateData);
    console.log('✅ Execution Details Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating execution details:', error.response?.data || error.message);
    throw error;
  }
};


// 4. Fetch Execution Details for a Specific Line Item
export const fetchExecutionDetailsForLineItem = async (lineItemId) => {
  try {
    if (!lineItemId) throw new Error("lineItemId is required");

    const encodedId = encodeURIComponent(lineItemId);
    const response = await API.get(`/executiondetails/lineitem/${encodedId}`);

    console.log('✅ Execution Details for Line Item:', response.data);

    // ✅ Ensure response is always an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`⚠️ No execution details found for lineItemId: ${lineItemId}`);
      return [];
    }

    console.error('❌ Error fetching execution details for line item:', error.response?.data || error.message);
    throw error;
  }
};


// 5. Delete Execution Details (For a Vendor-Process)
export const deleteExecutionDetails = async (executionId) => {
  try {
    if (!executionId) throw new Error("executionId is required");

    console.log(`🗑 Deleting Execution ID: ${executionId}`);
    
    const response = await API.delete(`/executiondetails/${executionId}`);
    console.log('✅ Execution Details Deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting execution details:', error.response?.data || error.message);
    throw error;
  }
};



export default API;
