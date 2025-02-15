import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { fetchExecutionDetailsGrouped,fetchLineItemDetails } from '../services/api';
import ExecutionEditPopup from './ExecutionEditPopup';
import LineItemDetailPopup from './LineItemDetailPopup';

const ExecutionDetailsPage = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [groupByProcessVendor, setGroupByProcessVendor] = useState(false);
  const [separateTablesView, setSeparateTablesView] = useState(false); // New state
  const [pageSize, setPageSize] = useState(10);
  const [selectedLineItem, setSelectedLineItem] = useState(null);
  const [lineItemDetails, setLineItemDetails] = useState(null);

  useEffect(() => {
    const loadExecutions = async () => {
      try {
        const data = await fetchExecutionDetailsGrouped();
        setExecutions(data);
      } catch (err) {
        console.error('❌ Error fetching execution details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExecutions();
  }, []);

  const toggleGrouping = () => setGroupByProcessVendor((prev) => !prev);
  const toggleSeparateTables = () => setSeparateTablesView((prev) => !prev); // Toggle button

  const groupedData = useMemo(() => {
    if (!groupByProcessVendor) return executions;
  
    const groupedMap = executions.reduce((acc, exec) => {
      const processId = exec.processInfo?.processId || exec.processId || 'Unknown Process';
      const vendorId = exec.vendorInfo?.vendorId || exec.vendorId || 'Unknown Vendor';
      const key = `${processId} - ${vendorId}`;
  
      if (!acc[key]) {
        acc[key] = {
          processVendor: key,
          processId,
          vendorId,
          subRows: [],
          lineItemIds: new Set(),
          orderIds: new Set(),
          statuses: new Set(),
          totalWeightSent: 0,
          totalWeightReceived: 0,
        };
      }
  
      acc[key].subRows.push(exec);
      acc[key].lineItemIds.add(exec.lineItemId); // ✅ Store all lineItemIds
      acc[key].orderIds.add(exec.orderId);
      acc[key].statuses.add(exec.status);
      acc[key].totalWeightSent += exec.outWeight;
      acc[key].totalWeightReceived += exec.actualWeightReceived || 0;
  
      return acc;
    }, {});
  
    return Object.values(groupedMap).map(group => ({
      ...group,
      lineItemId: [...group.lineItemIds].join(', '), // ✅ Join IDs with commas
      orderId: [...group.orderIds].join(', '),
      status: [...group.statuses].join(', '),
      outWeight: group.totalWeightSent,
      actualWeightReceived: group.totalWeightReceived,
    }));
  }, [executions, groupByProcessVendor]);
  

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  

  const processVendorGroups = useMemo(() => {
    return executions.reduce((acc, exec) => {
      const key = `${exec.processInfo?.processId || exec.processId} - ${exec.vendorId}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(exec);
      return acc;
    }, {});
  }, [executions]);
  const handleOpenLineItemPopup = async (lineItemId) => {
    try {
      const data = await fetchLineItemDetails(lineItemId);
      setLineItemDetails(data);
      setSelectedLineItem(lineItemId);
    } catch (error) {
      console.error('Error fetching line item details:', error);
    }
  };
  
  const handleCloseLineItemPopup = () => {
    setSelectedLineItem(null);
    setLineItemDetails(null);
  };
  const handleExecutionUpdate = (updatedExecution) => {
    console.log("✅ Execution Updated:", updatedExecution);
    setExecutions(prevExecutions =>
      prevExecutions.map(exec =>
        exec._id === updatedExecution._id ? { ...exec, ...updatedExecution } : exec
      )
    );
  };
  
  const columns = useMemo(() => [
    {
      accessorKey: 'processId',
      header: 'Process',
      cell: ({ row }) => row.original.processInfo?.processId || row.original.processId || 'Unknown Process',
    },
    {
      accessorKey: 'vendorId',
      header: 'Vendor',
      cell: ({ row }) => row.original.vendorInfo?.vendorId || row.original.vendorId || 'Unknown Vendor',
    },
    { 
      accessorKey: 'lineItemId', 
      header: 'Line Item',
      cell: ({ row }) => {
        const lineItemIds = row.original.lineItemId
          ? row.original.lineItemId.split(',').map(id => id.trim()) // Split & trim spaces
          : [];
    
        return (
          <div>
            {lineItemIds.map((id, index) => (
              <span 
                key={index} 
                className="clickable-link" 
                onClick={() => handleOpenLineItemPopup(id)} 
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginRight: '5px' }}
              >
                {id}
              </span>
            ))}
          </div>
        );
      },
    },
    
    { accessorKey: 'orderId', header: 'Order' },
    { accessorKey: 'outWeight', header: 'Weight Sent' },
    { accessorKey: 'actualWeightSent', header: 'Actual Weight Sent' },
    { accessorKey: 'inWeight', header: 'Weight Received' },
    { accessorKey: 'actualWeightReceived', header: 'Actual Weight Received' },
    {
      accessorKey: 'dateSent',
      header: 'Date Sent',
      cell: ({ row }) => formatDateTime(row.original.dateSent),
    },
    {
      accessorKey: 'dateReceived',
      header: 'Date Received',
      cell: ({ row }) => formatDateTime(row.original.dateReceived),
    },
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => <button onClick={() => setSelectedExecution(row.original)}>Edit</button>,
    },
  ], []);
  

  const table = useReactTable({
    data: groupedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // ✅ Pagination added
    state: { sorting },
    onSortingChange: setSorting,
    manualPagination: false, // ✅ Ensure internal pagination works
    initialState: {
      pagination: {
        pageIndex: 0,  // Start at first page
        pageSize: pageSize,  // Controlled page size
      },
    },
  });
  
  

  return (
    <div className="container">
      <h2>Execution Management</h2>

      {/* Toggle View Buttons */}
      <button onClick={toggleGrouping} style={{ marginBottom: '10px' }}>
        {groupByProcessVendor ? 'Disable Grouping' : 'Group by Process-Vendor'}
      </button>
      <button onClick={toggleSeparateTables} style={{ marginBottom: '10px', marginLeft: '10px' }}>
        {separateTablesView ? 'Show as Single Table' : 'Show as Separate Tables'}
      </button>

      {/* Show Separate Tables for Each Process-Vendor Combination */}
      {separateTablesView ? (
        Object.entries(processVendorGroups).map(([key, groupData]) => (
          <div key={key} style={{ marginBottom: '30px' }}>
            <h3>{key}</h3>
            <table border="1">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.accessorKey}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupData.map((row) => (
                  <tr key={row._id}>
                    <td>{row.processId}</td>
                    <td>{row.vendorId}</td>
                    <td>{row.lineItemId}</td>
                    <td>{row.orderId}</td>
                    <td>{row.outWeight}</td>
                    <td>{row.actualWeightSent}</td>
                    <td>{row.inWeight}</td>
                    <td>{row.actualWeightReceived}</td>
                    <td>{formatDateTime(row.dateSent)}</td> {/* ✅ Formatted Date */}
                    <td>{formatDateTime(row.dateReceived)}</td> 
                    <td>{row.status}</td>
                    <td>
                      <button onClick={() => setSelectedExecution(row)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <table border="1">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
          
        </table>
      )}
{/* Pagination Controls for Single Table View */}
{!separateTablesView && (
  <div className="pagination-controls">
    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
      ◀ Previous
    </button>
    <span> Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} </span>
    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
      Next ▶
    </button>

    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
      {[10, 20, 50].map(size => (
        <option key={size} value={size}>{size} rows</option>
      ))}
    </select>
  </div>
)}
        {selectedLineItem && <LineItemDetailPopup lineItemId={selectedLineItem} onClose={handleCloseLineItemPopup} />}
        {selectedExecution && (
  <ExecutionEditPopup 
    execution={selectedExecution} 
    onClose={() => setSelectedExecution(null)}
    onSave={(updatedExecution) => handleExecutionUpdate(updatedExecution)}
  />
)}

    </div>
  );
};

export default ExecutionDetailsPage;
