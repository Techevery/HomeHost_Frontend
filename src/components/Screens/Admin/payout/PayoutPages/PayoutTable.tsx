import React, { useState, useEffect } from "react";
import { Paper, Modal, Box, Button, IconButton } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { useLocation } from "react-router-dom";
import { MdFilterList, MdSearch, MdClose } from 'react-icons/md';
import useAdminStore from '../../../../../stores/admin';
import { ToastContainer, toast } from "react-toastify";


enum PayoutStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

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

  // Use the admin store
  const { 
    getSuccessfulPayouts,
    isLoading, 
    error, 
    clearError 
  } = useAdminStore();

  // State for payouts data
  const [payouts, setPayouts] = useState<any[]>([]);

  // Fetch payouts on component mount
  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await    getSuccessfulPayouts();
      // Handle different response structures
      if (response.data) {
        setPayouts(response.data);
      } else if (Array.isArray(response)) {
        setPayouts(response);
      } else if (response.payouts) {
        setPayouts(response.payouts);
      } else {
        setPayouts([]);
      }
    } catch (err) {
   
      setPayouts([]);
    }
  };

  // Transform payout data to table format based on actual API response
  const transformPayoutToRowData = (payout: any) => {
    const transaction = payout.transaction || {};
    const agent = payout.agent || {};
    const apartment = transaction.apartment || {};
    
    // Calculate amount details
    const grossAmount = transaction.amount || payout.amount || 0;
    const agentPercentage = transaction.agentPercentage || 0;
    const mockupPrice = transaction.mockupPrice || 0;
    const charges = payout.charges || 0; // Get charges from payout
    
    let agentAmount = 0;
    let calculationType = "";
    let calculationDetail = "";
    let amountDetail = "";
    let fee = 0;
    let netFee = 0; // Fee after subtracting charges

    // Determine calculation type and calculate accordingly
    if (mockupPrice > 0) {
      // Calculate based on markup (fixed amount)
      calculationType = "Markup";
      calculationDetail = `₦${mockupPrice.toLocaleString()}`;
      agentAmount = mockupPrice;
      amountDetail = `Fixed markup: ₦${mockupPrice.toLocaleString()}`;
      fee = agentAmount;
    } else if (agentPercentage > 0) {
      // Calculate based on percentage
      calculationType = "Percentage";
      calculationDetail = `${agentPercentage}%`;
      agentAmount = grossAmount * (agentPercentage / 100);
      amountDetail = `₦${grossAmount.toLocaleString()} x ${agentPercentage}%`;
      fee = agentAmount;
    } else {
      // Default case - use percentage calculation as fallback
      calculationType = "Percentage";
      calculationDetail = `${agentPercentage}%`;
      agentAmount = grossAmount * (agentPercentage / 100);
      amountDetail = `₦${grossAmount.toLocaleString()} x ${agentPercentage}%`;
      fee = agentAmount;
    }

    // Calculate net fee (fee - charges)
    netFee = Math.max(0, fee - charges);

    // Format period from booking dates
    let period = "N/A";
    if (transaction.booking_start_date && transaction.booking_end_date) {
      const startDate = new Date(transaction.booking_start_date);
      const endDate = new Date(transaction.booking_end_date);
      const durationDays = transaction.duration_days || 
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      const startFormatted = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const endFormatted = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      period = `${startFormatted} - ${endFormatted} (${durationDays} days)`;
    }

    // Format dates
    const createdDate = new Date(payout.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Get payment date from transaction
    const paymentDate = transaction.date_paid ? 
      new Date(transaction.date_paid).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : createdDate;

    // Map status from API to display status
    const statusMap: Record<string, string> = {
      'success': 'Approved',
      'pending': 'Pending',
      'failed': 'Rejected',
      'cancelled': 'Rejected'
    };

    const originalStatus = payout.status?.toLowerCase() || 'pending';
    const resolvedStatus = statusMap[originalStatus] || 'Pending';

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
      uploaded_date: new Date(payout.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      uploaded_by: "Admin",
      transaction_id: payout.transactionId || `TXN-${payout.id?.slice(-8)?.toUpperCase() || 'N/A'}`,
      payment_date: paymentDate
    } : null;

    return {
      id: payout.id,
      agent: agent.name || payout.accountName || 'Unknown Agent',
      agent_id: agent.id || payout.agentId || 'N/A',
      property: apartment.name || 'Unknown Property',
      booking: payout.reference || `BK-${payout.id?.slice(-4)?.toUpperCase() || 'N/A'}`,
      period,
      calculation_type: calculationType,
      calculation_detail: calculationDetail,
      amount_detail: amountDetail,
      amount: `₦${agentAmount.toLocaleString()}`,
      gross: `₦${grossAmount.toLocaleString()}`,
      fee: `₦${fee.toLocaleString()}`,
      net_fee: `₦${netFee.toLocaleString()}`,
      charges: `₦${charges.toLocaleString()}`,
      bank: payout.bankName || "Unknown Bank",
      account_number: payout.accountNumber || "---",
      date: createdDate,
      payment_date: paymentDate,
      submitted_date: `Submitted ${createdDate}`,
      status: resolvedStatus,
      originalStatus: payout.status, // Store original status for filtering
      originalPayout: payout, // Store original payout data for modal
      receipt: receipt,
      // For approved payouts, show remark; for rejected, show reason/remark
      admin_notes: payout.status?.toLowerCase() === 'success' ? payout.remark : null,
      rejection_reason: (payout.status?.toLowerCase() === 'failed' || payout.status?.toLowerCase() === 'cancelled') ? 
                       (payout.reason || payout.remark) : null,
      // Store additional data for modal
      account_name: payout.accountName,
      reference: payout.reference,
      proof: payout.proof,
      remark: payout.remark,
      reason: payout.reason,
      transaction_id: payout.transactionId,
      transaction_status: transaction.status,
      duration_days: transaction.duration_days,
      booking_start_date: transaction.booking_start_date,
      booking_end_date: transaction.booking_end_date,
      date_paid: transaction.date_paid,
      agent_percentage: agentPercentage,
      markup_price: mockupPrice,
      raw_amount: agentAmount,
      raw_fee: fee,
      raw_net_fee: netFee,
      raw_charges: charges,
      raw_gross: grossAmount
    };
  };

  const data = payouts.map(transformPayoutToRowData);

  // Apply both status filter and search filter
  useEffect(() => {
    let result = data;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      const statusMap: Record<PayoutStatus, string> = {
        [PayoutStatus.PENDING]: 'pending',
        [PayoutStatus.SUCCESS]: 'success',
        [PayoutStatus.FAILED]: 'failed',
        [PayoutStatus.CANCELLED]: 'cancelled'
      };
      const targetStatus = statusMap[statusFilter];
      result = result.filter(row => row.originalPayout.status?.toLowerCase() === targetStatus);
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
     
      } catch (error) {
        toast.error("Error downloading receipt:");
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
      Agent ID: ${selectedPayout.agent_id}
      Property: ${selectedPayout.property}
      Booking ID: ${selectedPayout.booking}
      Period: ${selectedPayout.period}
      Duration: ${selectedPayout.duration_days} days
      
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
      Charges: ${selectedPayout.charges}
      Net Fee (Fee - Charges): ${selectedPayout.net_fee}
      
      BANK DETAILS:
      -------------
      Bank: ${selectedPayout.bank}
      Account: ${selectedPayout.account_number}
      Account Name: ${selectedPayout.account_name}

      
      
      DATES:
      ------
      Created: ${selectedPayout.date}
      Payment Date: ${selectedPayout.payment_date}
      ${selectedPayout.submitted_date}
      
      STATUS: ${selectedPayout.status}
      Transaction Status: ${selectedPayout.transaction_status}
      
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
    { value: PayoutStatus.PENDING, label: 'Pending', count: data.filter(row => row.originalPayout.status?.toLowerCase() === 'pending').length },
    { value: PayoutStatus.SUCCESS, label: 'Approved', count: data.filter(row => row.originalPayout.status?.toLowerCase() === 'success').length },
    { value: PayoutStatus.FAILED, label: 'Rejected', count: data.filter(row => row.originalPayout.status?.toLowerCase() === 'failed').length },
    { value: PayoutStatus.CANCELLED, label: 'Cancelled', count: data.filter(row => row.originalPayout.status?.toLowerCase() === 'cancelled').length },
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
        <div className="min-w-[150px]">
          <div className="font-semibold text-[#002221]">{rowData.amount}</div>
          <div className="text-sm text-[#958F8F]">Gross: {rowData.gross}</div>
          <div className="text-sm text-[#958F8F]">Fee: {rowData.fee}</div>
          <div className="text-sm text-[#958F8F]">Charges: {rowData.charges}</div>
          <div className="text-sm font-medium text-[#002221]">Net Fee: {rowData.net_fee}</div>
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
           <div className="font-medium text-[#002221]">{rowData.account_name}</div>
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
          <div className="text-sm text-[#958F8F]">Paid: {rowData.payment_date}</div>
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
          onClick={fetchPayouts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>


      <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                    />
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
              data={filteredData}
              title=""
              options={{
                paging: !["dashboard", "home"].every((ai) =>
                  pathnames.includes(ai)
                )
                  ? true
                  : false,
                search: false,
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

      {/* View Modal - Single Consolidated Box with Uploaded Files Section */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="view-payout-modal"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '800px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-12 rounded-full ${
                selectedPayout?.status === "Approved" ? "bg-green-500" :
                selectedPayout?.status === "Rejected" ? "bg-red-500" :
                "bg-blue-500"
              }`}></div>
              <div>
                <h2 className="text-2xl font-bold text-[#002221]">
                  Payout Details
                </h2>
                <p className="text-sm text-[#958F8F] mt-1">
                  {selectedPayout?.booking} • {selectedPayout?.date}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPayout?.status === "Approved" ? "bg-green-100 text-green-800" :
                selectedPayout?.status === "Rejected" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {selectedPayout?.status}
              </div>
              <IconButton
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                size="small"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>
          </div>

          {/* Single Consolidated Content Box */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {selectedPayout && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Main Information Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Agent & Property Information */}
                      <div>
                        <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Agent & Property
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Agent:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.agent}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Agent ID:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.agent_id}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Property:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.property}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Booking Period:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.period}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-[#958F8F]">Duration:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.duration_days} days</span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div>
                        <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Bank Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Bank:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.bank}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Account Number:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.account_number}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-[#958F8F]">Account Name:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.account_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Amount Details */}
                      <div>
                        <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Amount Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Agent Amount:</span>
                            <span className="font-bold text-[#002221] text-lg">{selectedPayout.amount}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Gross Amount:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.gross}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Platform Fee:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.fee}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Charges:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.charges}</span>
                          </div>
                          <div className="flex justify-between py-2 bg-blue-50 px-3 py-2 rounded">
                            <span className="text-sm font-medium text-blue-700">Net Fee (Fee - Charges):</span>
                            <span className="font-bold text-blue-800 text-lg">{selectedPayout.net_fee}</span>
                          </div>
                        </div>
                      </div>

                      {/* Calculation Details */}
                      <div>
                        <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Calculation
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Type:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.calculation_type}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-[#958F8F]">Detail:</span>
                            <span className="font-medium text-[#002221]">{selectedPayout.calculation_detail}</span>
                          </div>
                          <div className="py-2">
                            <span className="text-sm text-[#958F8F] block mb-2">Formula:</span>
                            <span className="font-medium text-[#002221] text-sm bg-gray-50 px-3 py-2 rounded border block">{selectedPayout.amount_detail}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files Section - Always Visible */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Uploaded Files & Receipts
                    </h3>
                    
                    {selectedPayout.receipt ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-blue-800">{selectedPayout.receipt.file_name}</p>
                                <p className="text-sm text-blue-600">
                                  {selectedPayout.receipt.file_type.toUpperCase()} • {selectedPayout.receipt.file_size}
                                </p>
                                <div className="flex space-x-4 mt-1 text-xs text-blue-500">
                                  <span>Uploaded: {selectedPayout.receipt.uploaded_date}</span>
                                  <span>By: {selectedPayout.receipt.uploaded_by}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleViewReceipt}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                View File
                              </Button>
                              <Button
                                onClick={handleDownloadReceipt}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                          
                          {/* Additional Receipt Information */}
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
                            <div>
                              <label className="text-xs text-blue-600 font-medium block mb-1">Transaction ID:</label>
                              <p className="text-sm font-medium text-blue-800">{selectedPayout.receipt.transaction_id}</p>
                            </div>
                            <div>
                              <label className="text-xs text-blue-600 font-medium block mb-1">Payment Date:</label>
                              <p className="text-sm font-medium text-blue-800">{selectedPayout.receipt.payment_date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-800 font-medium">No files uploaded</p>
                        <p className="text-yellow-600 text-sm mt-1">No receipts or supporting documents have been uploaded for this payout.</p>
                      </div>
                    )}
                  </div>

                  {/* Status Specific Information */}
                  {selectedPayout.status === "Approved" && selectedPayout.admin_notes && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-green-800 mb-4 text-lg flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approval Details
                      </h3>
                      <div className="bg-green-50 p-4 rounded border border-green-200">
                        <label className="text-sm text-green-600 font-medium block mb-2">Approval Notes:</label>
                        <p className="text-green-800">{selectedPayout.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedPayout.status === "Rejected" && selectedPayout.rejection_reason && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-red-800 mb-4 text-lg flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rejection Details
                      </h3>
                      <div className="bg-red-50 p-4 rounded border border-red-200">
                        <label className="text-sm text-red-600 font-medium block mb-2">Reason:</label>
                        <p className="text-red-800">{selectedPayout.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-[#958F8F]">Created Date:</span>
                        <span className="font-medium text-[#002221]">{selectedPayout.date}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-[#958F8F]">Payment Date:</span>
                        <span className="font-medium text-[#002221]">{selectedPayout.payment_date}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#958F8F]">Transaction Status:</span>
                        <span className="font-medium text-[#002221]">{selectedPayout.transaction_status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={generatePDFReport}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF Report</span>
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