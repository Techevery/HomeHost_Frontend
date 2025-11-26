import React, { useState, useEffect } from "react";
import { Paper, Modal, Box, Button, IconButton } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { useLocation } from "react-router-dom";
import { MdFilterList, MdSearch, MdClose } from 'react-icons/md';
import useWalletStore, { PayoutStatus } from '../../../../../stores/payoutStore';

const PayoutTable = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Use the wallet store
  const { 
    payouts, 
    isLoading, 
    error, 
    getAllPayouts,
    clearError 
  } = useWalletStore();

  // Fetch payouts on component mount
  useEffect(() => {
    getAllPayouts();
  }, [getAllPayouts]);

  // Transform payout data to table format
  const transformPayoutToRowData = (payout: any) => {
    const transaction = payout.transaction || {};
    const agent = payout.agent || {};
    
    // Calculate amount details
    const grossAmount = transaction.amount || 0;
    const agentPercentage = transaction.agentPercentage || 0;
    const agentAmount = grossAmount * (agentPercentage / 100);
    const fee = grossAmount - agentAmount;

    // Format calculation details
    const calculationType = "Percentage";
    const calculationDetail = `${agentPercentage}%`;
    const amountDetail = `₦${grossAmount.toLocaleString()} x ${agentPercentage}%`;

    // Format period (you might want to get this from booking dates)
    const period = "Nov 19: Nov 22 (4 days)"; // Placeholder

    // Format dates
    const createdDate = new Date(payout.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const updatedDate = new Date(payout.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Map status
    const statusMap: Record<PayoutStatus, string> = {
      [PayoutStatus.PENDING]: 'Pending',
      [PayoutStatus.SUCCESS]: 'Approved',
      [PayoutStatus.FAILED]: 'Rejected',
      [PayoutStatus.CANCELLED]: 'Rejected'
    };

    // Ensure proper typing when indexing the map
    const statusKey = payout.status as PayoutStatus;
    const resolvedStatus = statusMap[statusKey] ?? 'Pending';

    // Get file name from proof URL
    const getFileNameFromUrl = (url: string) => {
      if (!url) return null;
      const parts = url.split('/');
      return parts[parts.length - 1] || `receipt_${payout.id}`;
    };

    // Get file type from URL
    const getFileTypeFromUrl = (url: string) => {
      if (!url) return 'unknown';
      const extension = url.split('.').pop()?.toLowerCase();
      return extension || 'file';
    };

    // Create receipt data if proof exists
    const receipt = payout.proof ? {
      file_name: getFileNameFromUrl(payout.proof),
      file_type: getFileTypeFromUrl(payout.proof),
      file_url: payout.proof,
      file_size: "2.4 MB", // You might want to get actual file size from backend
      uploaded_date: new Date(payout.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      uploaded_by: "Admin", // You might want to get actual uploader
      transaction_id: `TXN-${payout.id.slice(-8).toUpperCase()}`,
      payment_date: new Date(payout.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } : null;

    return {
      id: payout.id,
      agent: agent.name || 'Unknown Agent',
      property: transaction.apartment?.name || 'Unknown Property',
      booking: `BK-${payout.id.slice(-4).toUpperCase()}`,
      period,
      calculation_type: calculationType,
      calculation_detail: calculationDetail,
      amount_detail: amountDetail,
      amount: `₦${agentAmount.toLocaleString()}`,
      gross: `₦${grossAmount.toLocaleString()}`,
      fee: `₦${fee.toLocaleString()}`,
      bank: "GT Bank", // You might want to get this from agent profile
      account_number: "---" + payout.id.slice(-4),
      date: createdDate,
      submitted_date: `Submitted ${updatedDate}`,
      status: resolvedStatus,
      originalStatus: payout.status, // Store original status for filtering
      originalPayout: payout, // Store original payout data for modal
      receipt: receipt,
      // For approved payouts, show remark; for rejected, show reason
      admin_notes: payout.status === PayoutStatus.SUCCESS ? payout.remark : 
                   payout.status === PayoutStatus.CANCELLED ? payout.reason : 
                   null,
      rejection_reason: payout.status === PayoutStatus.CANCELLED ? payout.reason : null
    };
  };

  const data = payouts.map(transformPayoutToRowData);

  // Apply both status filter and search filter
  useEffect(() => {
    let result = data;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(row => row.originalStatus === statusFilter);
    }

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(row => 
        row.agent.toLowerCase().includes(searchLower) ||
        row.property.toLowerCase().includes(searchLower) ||
        row.booking.toLowerCase().includes(searchLower) ||
        row.amount.toLowerCase().includes(searchLower) ||
        row.bank.toLowerCase().includes(searchLower) ||
        row.status.toLowerCase().includes(searchLower) ||
        row.account_number.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(result);
  }, [payouts, statusFilter, searchText]);

  const handleViewClick = (rowData: any) => {
    setSelectedPayout(rowData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPayout(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const handleDownloadReceipt = async () => {
    if (selectedPayout?.receipt?.file_url) {
      try {
        const response = await fetch(selectedPayout.receipt.file_url);
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedPayout.receipt.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log("Downloaded receipt:", selectedPayout.receipt.file_name);
      } catch (error) {
        console.error("Error downloading receipt:", error);
        // Fallback: open in new tab if download fails
        window.open(selectedPayout.receipt.file_url, '_blank');
      }
    }
  };

  const handleViewReceipt = () => {
    if (selectedPayout?.receipt?.file_url) {
      // Open the receipt in a new tab
      window.open(selectedPayout.receipt.file_url, '_blank');
    }
  };

  // Generate PDF report for payout
  const generatePDFReport = () => {
    if (!selectedPayout) return;

    const pdfContent = `
      PAYOUT REPORT
      =============
      
      Agent: ${selectedPayout.agent}
      Property: ${selectedPayout.property}
      Booking ID: ${selectedPayout.booking}
      Period: ${selectedPayout.period}
      
      CALCULATION DETAILS:
      -------------------
      Type: ${selectedPayout.calculation_type}
      Detail: ${selectedPayout.calculation_detail}
      Formula: ${selectedPayout.amount_detail}
      
      AMOUNT BREAKDOWN:
      -----------------
      Agent Amount: ${selectedPayout.amount}
      Gross Amount: ${selectedPayout.gross}
      Platform Fee: ${selectedPayout.fee}
      
      BANK DETAILS:
      -------------
      Bank: ${selectedPayout.bank}
      Account: ${selectedPayout.account_number}
      
      DATES:
      ------
      Created: ${selectedPayout.date}
      ${selectedPayout.submitted_date}
      
      STATUS: ${selectedPayout.status}
      
      ${selectedPayout.admin_notes ? `ADMIN NOTES:\n${selectedPayout.admin_notes}` : ''}
      ${selectedPayout.rejection_reason ? `REJECTION REASON:\n${selectedPayout.rejection_reason}` : ''}
      
      ${selectedPayout.receipt ? `RECEIPT:\nFile: ${selectedPayout.receipt.file_name}\nTransaction ID: ${selectedPayout.receipt.transaction_id}` : ''}
      
      Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payout_report_${selectedPayout.booking}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Status filter options
  const statusFilterOptions = [
    { value: 'ALL' as const, label: 'All Status', count: data.length },
    { value: PayoutStatus.PENDING, label: 'Pending', count: data.filter(row => row.originalStatus === PayoutStatus.PENDING).length },
    { value: PayoutStatus.SUCCESS, label: 'Approved', count: data.filter(row => row.originalStatus === PayoutStatus.SUCCESS).length },
    { value: PayoutStatus.FAILED, label: 'Rejected', count: data.filter(row => row.originalStatus === PayoutStatus.FAILED).length },
    { value: PayoutStatus.CANCELLED, label: 'Cancelled', count: data.filter(row => row.originalStatus === PayoutStatus.CANCELLED).length },
  ];

  const COLUMNS = [
    {
      title: "AGENT & PROPERTY",
      field: "agent",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-[#002221]">{rowData.agent}</div>
          <div className="text-sm text-[#958F8F]">{rowData.property}</div>
          <div className="text-sm text-[#958F8F]">Booking: {rowData.booking}</div>
          <div className="text-sm text-[#958F8F]">{rowData.period}</div>
        </div>
      ),
    },
    {
      title: "CALCULATION",
      field: "calculation_type",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-[#002221]">{rowData.calculation_type}</div>
          <div className="text-sm text-[#958F8F]">{rowData.calculation_detail}</div>
          <div className="text-sm text-[#958F8F]">{rowData.amount_detail}</div>
        </div>
      ),
    },
    {
      title: "AMOUNT",
      field: "amount",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[120px]">
          <div className="font-semibold text-[#002221]">{rowData.amount}</div>
          <div className="text-sm text-[#958F8F]">Gross: {rowData.gross}</div>
          <div className="text-sm text-[#958F8F]">Fee: {rowData.fee}</div>
        </div>
      ),
    },
    {
      title: "BANK DETAILS",
      field: "bank",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[120px]">
          <div className="font-medium text-[#002221]">{rowData.bank}</div>
          <div className="text-sm text-[#958F8F]">{rowData.account_number}</div>
        </div>
      ),
    },
    {
      title: "DATE",
      field: "date",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[120px]">
          <div className="font-medium text-[#002221]">{rowData.date}</div>
          <div className="text-sm text-[#958F8F]">{rowData.submitted_date}</div>
        </div>
      ),
    },
    {
      title: "STATUS",
      field: "status",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[100px]">
          {rowData.status === "Approved" ? (
            <div className="bg-[#4EC368] text-white px-3 py-1 rounded-md text-sm font-medium w-fit">
              Approved
            </div>
          ) : rowData.status === "Rejected" ? (
            <div className="bg-[#DC2626] text-white px-3 py-1 rounded-md text-sm font-medium w-fit">
              Rejected
            </div>
          ) : (
            <div className="bg-[#4977E7] text-white px-3 py-1 rounded-md text-sm font-medium w-fit">
              Pending
            </div>
          )}
        </div>
      ),
    },
    {
      title: "ACTIONS",
      field: "actions",
      cellStyle: { paddingLeft: "2%" },
      headerStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="min-w-[100px]">
          <button
            onClick={() => handleViewClick(rowData)}
            className="text-[#4977E7] hover:text-[#3B67D1] font-medium underline text-sm"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  const defaultMaterialTheme = createTheme({
    palette: {
      // mode: "light",
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E8E9ED] p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading payouts...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E8E9ED] p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={getAllPayouts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">{error}</div>
          <button 
            onClick={clearError}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Filter Panel */}
      {showStatusFilter && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MdFilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? option.value === 'ALL' 
                      ? 'bg-blue-600 text-white'
                      : option.value === PayoutStatus.PENDING
                      ? 'bg-yellow-600 text-white'
                      : option.value === PayoutStatus.SUCCESS
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label} 
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === option.value 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-100'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    
      {/* Table Section */}
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E8E9ED]">
        <ThemeProvider theme={defaultMaterialTheme}>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />

          <div className="w-full overflow-auto">
            <MaterialTable
              components={{
                Container: (props) => <Paper {...props} elevation={0} />,
                Toolbar: (props) => (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between p-4">
                      {/* Custom Search Field */}
                      <div className="relative flex-1 max-w-md">
                        <div className="relative">
                          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search payouts..."
                            value={searchText}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                          {searchText && (
                            <button
                              onClick={clearSearch}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <MdClose className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {searchText && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 p-2">
                            <div className="text-sm text-gray-600">
                              Searching for: "<span className="font-medium">{searchText}</span>"
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Found {filteredData.length} results
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Filter Button */}
                      <button
                        onClick={() => setShowStatusFilter(!showStatusFilter)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          showStatusFilter || statusFilter !== 'ALL'
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <MdFilterList className="w-4 h-4" />
                        Filter
                        {(statusFilter !== 'ALL' || searchText) && (
                          <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                            {filteredData.length}
                          </span>
                        )}
                      </button>
                    </div>
                    {props.components?.Actions && (
                      <props.components.Actions {...props} />
                    )}
                  </div>
                ),
              }}
              columns={COLUMNS}
              data={filteredData} // Use filtered data instead of all data
              title=""
              options={{
                paging: !["dashboard", "home"].every((ai) =>
                  pathnames.includes(ai)
                )
                  ? true
                  : false,
                search: false, // Disable default search since we have custom search
                rowStyle: {
                  color: "#002221",
                  backgroundColor: "transparent",
                  fontWeight: 400,
                  fontSize: "16px",
                  padding: "20px 0",
                  borderBottom: "1px solid #E8E9ED",
                },
                headerStyle: {
                  color: "#002221",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#F9FAFB",
                  border: 0,
                  borderBottom: "1px solid #E8E9ED",
                  padding: "16px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                },
                actionsColumnIndex: -1,
                actionsCellStyle: {
                  border: "0",
                },
                exportButton: true,
                minBodyHeight: "400px",
                pageSize: 5,
                pageSizeOptions: [5, 10, 20],
                showTitle: false,
                searchAutoFocus: false,
                toolbarButtonAlignment: "left",
              }}
            />
          </div>
        </ThemeProvider>
      </div>

      {/* View Modal - Showing Uploaded Receipt */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="view-payout-modal"
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'flex-end',
          marginTop: '20px'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '600px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginRight: '40px',
            marginTop: '20px'
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-xl font-bold text-[#002221]">
                Payout Details
              </h2>
              <p className="text-sm text-[#958F8F] mt-1">
                {selectedPayout?.agent} - {selectedPayout?.booking}
              </p>
            </div>
            <IconButton
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
              size="small"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>

          {/* Scrollable Content - Payment Information and Uploaded Receipt */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 140px)' }}>
            {selectedPayout && (
              <div className="space-y-6">
                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#002221] mb-4 text-lg">Payment Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#958F8F] block">Agent</label>
                        <p className="font-medium text-[#002221]">{selectedPayout.agent}</p>
                      </div>
                      <div>
                        <label className="text-sm text-[#958F8F] block">Booking</label>
                        <p className="font-medium text-[#002221]">{selectedPayout.booking}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#958F8F] block">Amount</label>
                        <p className="font-medium text-[#002221] text-lg">{selectedPayout.amount}</p>
                      </div>
                      <div>
                        <label className="text-sm text-[#958F8F] block">Status</label>
                        <div className={`px-3 py-1 rounded-md text-sm font-medium w-fit ${
                          selectedPayout.status === "Approved" 
                            ? "bg-[#4EC368] text-white" 
                            : selectedPayout.status === "Rejected"
                            ? "bg-[#DC2626] text-white"
                            : "bg-[#4977E7] text-white"
                        }`}>
                          {selectedPayout.status}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#958F8F] block">Bank</label>
                        <p className="font-medium text-[#002221]">{selectedPayout.bank}</p>
                      </div>
                      <div>
                        <label className="text-sm text-[#958F8F] block">Account</label>
                        <p className="font-medium text-[#002221]">{selectedPayout.account_number}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-[#958F8F] block">Calculation</label>
                      <p className="font-medium text-[#002221]">{selectedPayout.calculation_type} - {selectedPayout.calculation_detail}</p>
                      <p className="text-sm text-[#958F8F]">{selectedPayout.amount_detail}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes for Approved Payouts */}
                {selectedPayout.status === "Approved" && selectedPayout.admin_notes && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">Approval Notes</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-blue-800 bg-blue-25 p-3 rounded border border-blue-200">
                          {selectedPayout.admin_notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Receipt Section - Only show for approved payouts with proof */}
                {selectedPayout.status === "Approved" && selectedPayout.receipt && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-4 text-lg">Uploaded Receipt</h3>
                    <div className="space-y-4">
                      {/* Receipt File Preview */}
                      <div className="border-2 border-green-300 rounded-lg p-6 text-center bg-white">
                        <div className="text-green-500 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="font-medium text-green-800 mb-2">{selectedPayout.receipt.file_name}</p>
                        <p className="text-sm text-green-600 mb-4">
                          {selectedPayout.receipt.file_type.toUpperCase()} • {selectedPayout.receipt.file_size}
                        </p>
                        
                        {/* Receipt Details */}
                        <div className="grid grid-cols-2 gap-4 text-left mb-4">
                          <div>
                            <label className="text-xs text-green-600 block">Transaction ID</label>
                            <p className="text-sm font-medium text-green-800">{selectedPayout.receipt.transaction_id}</p>
                          </div>
                          <div>
                            <label className="text-xs text-green-600 block">Payment Date</label>
                            <p className="text-sm font-medium text-green-800">{selectedPayout.receipt.payment_date}</p>
                          </div>
                          <div>
                            <label className="text-xs text-green-600 block">Uploaded By</label>
                            <p className="text-sm font-medium text-green-800">{selectedPayout.receipt.uploaded_by}</p>
                          </div>
                          <div>
                            <label className="text-xs text-green-600 block">Upload Date</label>
                            <p className="text-sm font-medium text-green-800">{selectedPayout.receipt.uploaded_date}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 justify-center">
                          <Button
                            onClick={handleViewReceipt}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            View Receipt
                          </Button>
                          <Button
                            onClick={handleDownloadReceipt}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejected Payout - Show Rejection Reason */}
                {selectedPayout.status === "Rejected" && selectedPayout.rejection_reason && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-3 text-lg">Rejection Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-red-600 font-medium block mb-2">Reason for Rejection:</label>
                        <p className="text-red-800 bg-red-25 p-3 rounded border border-red-200">
                          {selectedPayout.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Payout - No additional actions */}
                {selectedPayout.status === "Pending" && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">Pending Approval</h3>
                    <p className="text-blue-700">
                      This payout request is currently pending approval. Once approved or rejected, 
                      additional details will be available here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={generatePDFReport}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Download PDF Report
            </Button>
            <div className="flex space-x-3">
              <Button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default PayoutTable;