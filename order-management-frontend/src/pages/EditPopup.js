import React, { useState, useEffect } from 'react';
import { fetchExecutionDetailsForLineItem,addExecutionDetails,fetchVendors, fetchProcesses, fetchLineItemProcesses, reorderLineItemProcesses, createLineItemProcess, deleteLineItemProcess,fetchAllVendorProcesses } from '../services/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const EditPopup = ({ lineItem, onClose, onSave }) => {
  const [vendors, setVendors] = useState([]); // Vendor list
  const [processes, setProcesses] = useState([]); // Process list
  const [vendorProcesses, setVendorProcesses] = useState([]); // Vendor-Process relationships
  const [lineItemProcesses, setLineItemProcesses] = useState([]); // Existing LineItemProcesses
  const [newProcess, setNewProcess] = useState({ processId: '', vendorId: '' });
  const [draggedProcess, setDraggedProcess] = useState(null);
  const [filteredVendors, setFilteredVendors] = useState([]); // Vendors filtered by process
  const [filteredProcesses, setFilteredProcesses] = useState([]); // Processes filtered by vendor

  useEffect(() => {
    // Fetch initial data for vendors, processes, and line item processes
    const loadInitialData = async () => {
      try {
        const encodedLineItemId = encodeURIComponent(lineItem.lineItemId); // Encode lineItemId
        console.log('editpopup: Encoded lineItemId:', encodedLineItemId);

        // Fetch vendors
        const vendorData = await fetchVendors();
        console.log('editpopup: Fetched vendors:', vendorData);
        setVendors(vendorData);

        // Fetch processes
        const processData = await fetchProcesses();
        console.log('editpopup: Fetched processes:', processData);
        setProcesses(processData);

        // Fetch line item processes
        const lineItemProcessData = await fetchLineItemProcesses(encodedLineItemId);
        console.log('editpopup: Fetched line item processes:', lineItemProcessData);
        console.log('Fetching initial data...');

        const vendorProcessData = await fetchAllVendorProcesses();
        console.log('Fetched all vendor-process mappings:', vendorProcessData);

        if (!Array.isArray(vendorProcessData)) {
          console.error('Invalid data format for vendorProcesses:', vendorProcessData);
          return;
        }

        setVendorProcesses(vendorProcessData);
        // Log each item in lineItemProcessData
        lineItemProcessData.forEach((item, index) => {
          console.log(`editpopup: Line item process ${index}:`, item);
          console.log(`editpopup: Line item process ${index} _id:`, item._id);
        });

        setLineItemProcesses(
          lineItemProcessData.map((process, index) => ({
            ...process,
            customId: `${process.lineItemId}/${process.vendorId}/${process.processId}/${process.sequence}`,
          }))
        );
        //setVendorProcesses(vendorProcessData);
      } catch (err) {
        console.error('editpopup: Error loading initial data:', err.message);
      }
    };

    if (lineItem.lineItemId) {
      loadInitialData(); // Fetch data if lineItemId is available
    }
  }, [lineItem.lineItemId]);
 // Filter vendors based on selected process
 useEffect(() => {
  console.log('Filtering vendors for processId:', newProcess.processId);
  console.log('Current Vendor-Process mappings:', vendorProcesses);
  console.log('Current Vendors:', vendors);

  if (newProcess.processId) {
    const allowedVendors = vendorProcesses
      .filter(vp => vp.processId === newProcess.processId)
      .map(vp => vp.vendorId);

    console.log('Allowed Vendors:', allowedVendors);
    const updatedVendors = vendors.filter(v => allowedVendors.includes(v.vendorId));
    console.log('Filtered Vendors:', updatedVendors);
    setFilteredVendors(updatedVendors);
  } else {
    setFilteredVendors(vendors);
  }
}, [newProcess.processId, vendors, vendorProcesses]);

useEffect(() => {
  if (newProcess.vendorId) {
    console.log('Filtering processes for vendorId:', newProcess.vendorId);
    const allowedProcesses = vendorProcesses
      .filter(vp => vp.vendorId === newProcess.vendorId)
      .map(vp => vp.processId);

    console.log('Allowed Processes:', allowedProcesses);
    setFilteredProcesses(processes.filter(p => allowedProcesses.includes(p.processId)));
  } else {
    setFilteredProcesses(processes);
  }
}, [newProcess.vendorId, processes, vendorProcesses]);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sortable item component
  const SortableItem = ({ id, process }) => {
    id = process.customId; // Ensure id uses customId  
    //console.log('SortableItem props:', { id, process });

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: id
    });

    if (!id || !process) {
      console.error('SortableItem received undefined id or process:', { id, process });
      return null;
    }
    

    const handleRemove = async (e) => {
      e.stopPropagation(); // Prevent drag event from triggering
      try {
        // Make sure we have both IDs
        if (!lineItem.lineItemId || !process._id) {
          console.error('Missing required IDs for deletion');
          return;
        }

        console.log('Removing process:', {
          lineItemId: lineItem.lineItemId,
          processId: process.customId
        });

        // Call delete API with the correct IDs
        await deleteLineItemProcess(lineItem.lineItemId, process.customId);

        // Update state after successful deletion
        setLineItemProcesses(prev =>
          prev.filter(item => item.customId !== process.customId)
        );
      } catch (err) {
        console.error('Error removing process:', err);
      }
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      padding: '10px',
      margin: '5px 0',
      background: '#f8f8f8',
      border: '1px solid #ddd',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <span>
          Sequence: {process.sequence},
          Process: {process.processId},
          Vendor: {process.vendorId}
        </span>
        <button
          onClick={handleRemove}
          style={{
            marginLeft: '10px',
            color: 'red',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>
    );
  };

  const handleDragEnd = (event) => {
    if (!event || !event.active || !event.over) {
      console.warn('handleDragEnd: Missing active or over:', event);
      return;
    }
  
    const { active, over } = event;
  
    if (!active.id || !over.id) {
      console.warn('handleDragEnd: Missing ID in active or over:', { active, over });
      return;
    }
  
    console.log(`handleDragEnd: Moving ${active.id} over ${over.id}`);
  
    setLineItemProcesses((items) => {
      const oldIndex = items.findIndex((item) => item.customId === active.id);
      const newIndex = items.findIndex((item) => item.customId === over.id);
      
  
      if (oldIndex === -1 || newIndex === -1) {
        console.warn('handleDragEnd: Invalid indices:', { oldIndex, newIndex });
        return items;
      }
  
      const updatedItems = arrayMove(items, oldIndex, newIndex);
  
      return updatedItems.map((item, index) => ({
        ...item,
        sequence: index + 1,
        customId: `${item.lineItemId}/${item.vendorId}/${item.processId}/${index + 1}`,
      }));
    });
  };
  

  const handleAddProcess = async () => {
    if (!newProcess.processId || !newProcess.vendorId) {
      console.warn('editpopup: Please select both a process and a vendor before adding.');
      return;
    }
  
    try {
      // Generate sequence number based on current processes count
      const newSequence = lineItemProcesses.length + 1;
  
      // Create a unique custom ID
      const newCustomId = `${lineItem.lineItemId}/${newProcess.vendorId}/${newProcess.processId}/${newSequence}`;
  
      // Check if the same process already exists
      const isDuplicate = lineItemProcesses.some(item => item.customId === newCustomId);
      if (isDuplicate) {
        console.warn(`editpopup: Process with ID ${newCustomId} already exists.`);
        return;
      }
  
      const newEntry = {
        lineItemId: lineItem.lineItemId,
        processId: newProcess.processId,
        vendorId: newProcess.vendorId,
        sequence: newSequence,
        customId: newCustomId,
      };
  
      console.log('editpopup: Sending new process to backend:', newEntry);
  
      // Save to backend and capture response
      const response = await createLineItemProcess(newEntry);
  
      if (!response || response.error) {
        console.error('editpopup: Backend error:', response?.error || 'Unknown error');
        return;
      }
  
      console.log('editpopup: Process successfully added:', response);
  
      // Fetch latest processes instead of appending manually (prevents stale data issues)
      const updatedProcesses = await fetchLineItemProcesses(encodeURIComponent(lineItem.lineItemId));
  
      // Update state with the newly fetched list
      setLineItemProcesses(
        updatedProcesses.map((process, index) => ({
          ...process,
          sequence: index + 1, // Ensure correct sequence
          customId: `${process.lineItemId}/${process.vendorId}/${process.processId}/${index + 1}`,
        }))
      );
  
      console.log('editpopup: Updated lineItemProcesses after addition:', updatedProcesses);
  
      // Reset form input
      setNewProcess({ processId: '', vendorId: '' });
  
    } catch (err) {
      console.error('editpopup: Error adding new process:', err);
    }
  };
  // **📏 Dynamic Popup Sizing**
  const popupHeight = Math.min(300 + lineItemProcesses.length * 40, 600); // Max height 600px
  const popupWidth = Math.min(400 + lineItemProcesses.length * 20, 800); // Max width 800px

  const handleSave = async () => {
    try {
      const encodedLineItemId = encodeURIComponent(lineItem.lineItemId);
      console.log(`editpopup: Encoded lineItemId for save: ${encodedLineItemId}`);
  
      // Extract unique processIds and vendorIds from lineItemProcesses
      const updatedProcessIds = [...new Set(lineItemProcesses.map(p => p.processId))];
      const updatedVendorIds = [...new Set(lineItemProcesses.map(p => p.vendorId))];
  
      console.log("Updated Process IDs:", updatedProcessIds);
      console.log("Updated Vendor IDs:", updatedVendorIds);
  
      // Prepare the payload for saving reordered processes
      const reorderedProcessesPayload = lineItemProcesses.map((process) => ({
        customId: process.customId,
        sequence: process.sequence,
      }));
  
      console.log("Saving reordered processes:", reorderedProcessesPayload);
      await reorderLineItemProcesses(encodedLineItemId, reorderedProcessesPayload);
      console.log("editpopup: Saved reordered processes successfully!");
  
      // Fetch existing execution details to prevent duplicates
      console.log(`editpopup: Saving execution details for lineItemId: ${lineItem.lineItemId}`);
      const existingExecutions = await fetchExecutionDetailsForLineItem(lineItem.lineItemId);
  
      const newExecutions = lineItemProcesses.map((process) => {
        const executionExists = existingExecutions.some(exec =>
          exec.processId === process.processId &&
          exec.vendorId === process.vendorId &&
          exec.lineItemId === lineItem.lineItemId
        );
  
        if (!executionExists) {
          return {
            lineItemId: lineItem.lineItemId,
            orderId: lineItem.orderId,
            processId: process.processId,
            vendorId: process.vendorId,
            outWeight: lineItem.weight || 0,
            inWeight: 0,
            dateSent: new Date().toISOString().split('T')[0],
            dateReceived: null,
            piecesSent: process.piecesSent !== undefined ? process.piecesSent : 1,
            piecesReceived: 0,
            status: 'Pending',
            dateCreated: new Date().toISOString(),
          };
        }
        return null;
      }).filter(Boolean);
  
      for (const execution of newExecutions) {
        console.log("✅ Sending Execution:", execution);
        await addExecutionDetails(execution);
      }
  
      // Update the parent component with new processIds and vendorIds
      onSave({
        ...lineItem,
        processIds: updatedProcessIds,
        vendorIds: updatedVendorIds,
      });
  
      onClose();
    } catch (err) {
      console.error("editpopup: Error saving processes:", err.message);
    }
  };
  
  
  
  return (
    <div className="popup">
      <div className="popup-overlay">
      <div
        className="popup-content"
        style={{
          width: `${popupWidth}px`,  // Dynamic width
          height: `${popupHeight}px`, // Dynamic height
          overflowY: "auto", // Scroll if too large
        }}
      >
        <h2>Edit Line Item</h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lineItemProcesses.map(process => process.customId)}
            strategy={verticalListSortingStrategy}
          >
            {lineItemProcesses.map((process) => {
              const id = process.customId;
              const validProcess = process && id;

              return validProcess ? (
                <SortableItem
                  key={id}
                  id={id}
                  process={process} // Pass the entire process object
                />
              ) : null;
            })}
          </SortableContext>
        </DndContext>

        <div style={{ marginTop: '20px' }}>
          <h3>Add New Process</h3>
          <select
            value={newProcess.processId}
            onChange={(e) => setNewProcess((prev) => ({ ...prev, processId: e.target.value }))}
            style={{ marginRight: '10px' }}
          >
            <option value="">Select Process</option>
            {filteredProcesses.map((process) => (
              <option key={process.processId} value={process.processId}>
                {process.processId}
              </option>
            ))}
          </select>
          <select
            value={newProcess.vendorId}
            onChange={(e) => setNewProcess((prev) => ({ ...prev, vendorId: e.target.value }))}
            style={{ marginRight: '10px' }}
          >
            <option value="">Select Vendor</option>
            {filteredVendors.map((vendor) => (
              <option key={vendor.vendorId} value={vendor.vendorId}>
                {vendor.vendorId}
              </option>
            ))}
          </select>
          <button onClick={handleAddProcess} style={{ padding: '5px 10px', background: 'blue', color: 'white' }}>
            Add
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={handleSave} style={{ padding: '5px 10px', background: 'green', color: 'white' }}>
            Save
          </button>
          <button onClick={onClose} style={{ padding: '5px 10px', background: 'red', color: 'white' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditPopup;