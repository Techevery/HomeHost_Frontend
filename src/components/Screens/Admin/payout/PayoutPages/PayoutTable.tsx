import React, { useState, useEffect } from "react";
import { Paper, Modal, Box, Button, IconButton, Dialog, DialogContent } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import { useLocation } from "react-router-dom";
import { MdFilterList, MdSearch, MdClose, MdPictureAsPdf } from 'react-icons/md';
import useAdminStore from '../../../../../stores/admin';
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { 
    getSuccessfulPayouts, // CHANGE THIS: This might only get successful payouts
    isLoading, 
    error, 
    clearError 
  } = useAdminStore();

  const [payouts, setPayouts] = useState<any[]>([]);

  
  useEffect(() => {
    fetchPayouts();
  }, []);

  // FIX: Change to get ALL payouts, not just successful ones
  const fetchPayouts = async () => {
    try {
      // You need a method to get ALL payouts, not just successful ones
      // For now, let's use getSuccessfulPayouts but this might need to change
      const response = await getSuccessfulPayouts();
    
      if (response.data) {
        setPayouts(response.data);
      } else if (Array.isArray(response)) {
        setPayouts(response);
      } else if (response.payouts) {
        setPayouts(response.payouts);
      } else {
        setPayouts([]);
      }
      
      // Debug log to see what data we're getting
      console.log('Fetched payouts:', response);
      console.log('First payout status:', response.data?.[0]?.status);
      
    } catch (err) {
      console.error('Error fetching payouts:', err);
      setPayouts([]);
    }
  };

  const transformPayoutToRowData = (payout: any) => {
    const transaction = payout.transaction || {};
    const agent = payout.agent || {};
    const apartment = transaction.apartment || {};
    
    const grossAmount = transaction.amount || payout.amount || 0;
    const agentPercentage = transaction.agentPercentage || 0;
    const mockupPrice = transaction.mockupPrice || 0;
    const charges = payout.charges || 0; 
    
    let agentAmount = 0;
    let calculationType = "";
    let calculationDetail = "";
    let amountDetail = "";
    let fee = 0;
    let netFee = 0; 

    if (mockupPrice > 0) {
      calculationType = "Markup";
      calculationDetail = `₦${mockupPrice.toLocaleString()}`;
      agentAmount = mockupPrice;
      amountDetail = `Fixed markup: ₦${mockupPrice.toLocaleString()}`;
      fee = agentAmount;
    } else if (agentPercentage > 0) {
      calculationType = "Percentage";
      calculationDetail = `${agentPercentage}%`;
      agentAmount = grossAmount * (agentPercentage / 100);
      amountDetail = `₦${grossAmount.toLocaleString()} x ${agentPercentage}%`;
      fee = agentAmount;
    } else {
      calculationType = "Percentage";
      calculationDetail = `${agentPercentage}%`;
      agentAmount = grossAmount * (agentPercentage / 100);
      amountDetail = `₦${grossAmount.toLocaleString()} x ${agentPercentage}%`;
      fee = agentAmount;
    }

    netFee = Math.max(0, fee - charges);

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

    const createdDate = new Date(payout.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const paymentDate = transaction.date_paid ? 
      new Date(transaction.date_paid).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : createdDate;

    // FIXED: Better status mapping with case-insensitive check
    const getResolvedStatus = (status: string): string => {
      if (!status) return 'Pending';
      
      const statusUpper = status.toUpperCase();
      
      if (statusUpper.includes('SUCCESS') || statusUpper.includes('APPROVED')) {
        return 'Approved';
      } else if (statusUpper.includes('FAILED') || statusUpper.includes('REJECTED') || statusUpper.includes('CANCELLED')) {
        return 'Rejected';
      } else if (statusUpper.includes('PENDING')) {
        return 'Pending';
      }
      
      return 'Pending';
    };

    const resolvedStatus = getResolvedStatus(payout.status);

    // Get file name from proof URL
    const getFileNameFromUrl = (url: string) => {
      if (!url) return null;
      const parts = url.split('/');
      return parts[parts.length - 1] || `receipt_${payout.id}`;
    };

    const getFileTypeFromUrl = (url: string) => {
      if (!url) return 'unknown';
      const extension = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
        return 'image';
      } else if (['pdf'].includes(extension || '')) {
        return 'pdf';
      }
      return 'file';
    };

    // FIXED: Get rejection reason from multiple possible fields
    const isRejected = resolvedStatus === 'Rejected';
    const rejectionReason = isRejected ? 
      (payout.reason || payout.reasson || payout.remark || 'No reason provided') : null;

    const receipt = payout.proof ? {
      file_name: getFileNameFromUrl(payout.proof),
      file_type: getFileTypeFromUrl(payout.proof),
      file_url: payout.proof,
      file_size: "2.4 MB", 
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
      originalStatus: payout.status,
      originalPayout: payout, 
      receipt: receipt,
    
      admin_notes: resolvedStatus === 'Approved' ? payout.remark : null,
      rejection_reason: rejectionReason,
      
      account_name: payout.accountName,
      reference: payout.reference,
      proof: payout.proof,
      remark: payout.remark,
      reason: payout.reason,
      reasson: payout.reasson,
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

  useEffect(() => {
    let result = data;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      const statusMap: Record<PayoutStatus, string> = {
        [PayoutStatus.PENDING]: 'Pending',
        [PayoutStatus.SUCCESS]: 'Approved',
        [PayoutStatus.FAILED]: 'Rejected',
        [PayoutStatus.CANCELLED]: 'Rejected'
      };
      const targetStatus = statusMap[statusFilter];
      result = result.filter(row => row.status === targetStatus);
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

  // Debug: Log what data we have
  useEffect(() => {
    if (data.length > 0) {
      console.log('Transformed data sample:', data[0]);
      console.log('All statuses:', data.map(d => ({ 
        original: d.originalStatus, 
        resolved: d.status,
        id: d.id 
      })));
    }
  }, [data]);

  const handleViewClick = (rowData: any) => {
    setSelectedPayout(rowData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPayout(null);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedPayout.receipt.file_name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        toast.success("Receipt downloaded successfully!");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Error downloading receipt. Please try again.");
      
        window.open(selectedPayout.receipt.file_url, '_blank');
      }
    } else {
      toast.error("No receipt available to download.");
    }
  };

  const handleViewReceipt = () => {
    if (selectedPayout?.receipt?.file_url) {
      const fileType = selectedPayout.receipt.file_type;
      
      if (fileType === 'image') {
        setImageModalOpen(true);
      } else if (fileType === 'pdf') {
        window.open(selectedPayout.receipt.file_url, '_blank');
      } else {
        window.open(selectedPayout.receipt.file_url, '_blank');
      }
    } else {
      toast.error("No receipt available to view.");
    }
  };

  const generatePDFReport = () => {
    if (!selectedPayout) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = margin;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("PAYOUT REPORT", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AGENT & PROPERTY INFORMATION", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Agent: ${selectedPayout.agent}`, margin, yPos);
      yPos += 7;
      doc.text(`Agent ID: ${selectedPayout.agent_id}`, margin, yPos);
      yPos += 7;
      doc.text(`Property: ${selectedPayout.property}`, margin, yPos);
      yPos += 7;
      doc.text(`Booking ID: ${selectedPayout.booking}`, margin, yPos);
      yPos += 7;
      doc.text(`Period: ${selectedPayout.period}`, margin, yPos);
      yPos += 7;
      doc.text(`Duration: ${selectedPayout.duration_days} days`, margin, yPos);
      yPos += 12;

      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.text("CALCULATION DETAILS", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Type: ${selectedPayout.calculation_type}`, margin, yPos);
      yPos += 7;
      doc.text(`Detail: ${selectedPayout.calculation_detail}`, margin, yPos);
      yPos += 7;
      doc.text(`Formula: ${selectedPayout.amount_detail}`, margin, yPos);
      yPos += 12;

      doc.setFont("helvetica", "bold");
      doc.text("AMOUNT BREAKDOWN", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Agent Amount: ${selectedPayout.amount}`, margin, yPos);
      yPos += 7;
      doc.text(`Gross Amount: ${selectedPayout.gross}`, margin, yPos);
      yPos += 7;
      doc.text(`Platform Fee: ${selectedPayout.fee}`, margin, yPos);
      yPos += 7;
      doc.text(`Charges: ${selectedPayout.charges}`, margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text(`Net Fee (Fee - Charges): ${selectedPayout.net_fee}`, margin, yPos);
      yPos += 12;

      doc.setFont("helvetica", "bold");
      doc.text("BANK DETAILS", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Bank: ${selectedPayout.bank}`, margin, yPos);
      yPos += 7;
      doc.text(`Account Number: ${selectedPayout.account_number}`, margin, yPos);
      yPos += 7;
      doc.text(`Account Name: ${selectedPayout.account_name}`, margin, yPos);
      yPos += 12;

      // Dates
      doc.setFont("helvetica", "bold");
      doc.text("DATES", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Created Date: ${selectedPayout.date}`, margin, yPos);
      yPos += 7;
      doc.text(`Payment Date: ${selectedPayout.payment_date}`, margin, yPos);
      yPos += 7;
      doc.text(`Transaction Status: ${selectedPayout.transaction_status}`, margin, yPos);
      yPos += 12;

      // Status Information
      doc.setFont("helvetica", "bold");
      doc.text("STATUS", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Status: ${selectedPayout.status}`, margin, yPos);
      yPos += 7;

      if (selectedPayout.admin_notes) {
        doc.text(`Admin Notes: ${selectedPayout.admin_notes}`, margin, yPos);
        yPos += 7;
      }

      if (selectedPayout.rejection_reason) {
        doc.text(`Rejection Reason: ${selectedPayout.rejection_reason}`, margin, yPos);
        yPos += 7;
      }

      // Footer
      yPos = 280;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: "center" });

      // Save the PDF
      doc.save(`payout_report_${selectedPayout.booking}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF report. Please try again.");
    }
  };

  // Status filter options
  const statusFilterOptions = [
    { value: 'ALL' as const, label: 'All Status', count: data.length },
    { value: PayoutStatus.PENDING, label: 'Pending', count: data.filter(row => row.status === 'Pending').length },
    { value: PayoutStatus.SUCCESS, label: 'Approved', count: data.filter(row => row.status === 'Approved').length },
    { value: PayoutStatus.FAILED, label: 'Rejected', count: data.filter(row => row.status === 'Rejected').length },
    { value: PayoutStatus.CANCELLED, label: 'Cancelled', count: data.filter(row => {
      const originalStatus = (row.originalStatus || '').toUpperCase();
      return originalStatus === 'CANCELLED';
    }).length },
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
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E8E9ED] p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading payouts...</div>
      </div>
    );
  }

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

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-[#002221] mb-4 text-lg flex items-center">
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
                                {selectedPayout.receipt.file_type === 'image' ? (
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                ) : selectedPayout.receipt.file_type === 'pdf' ? (
                                  <MdPictureAsPdf className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
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
                                {selectedPayout.receipt.file_type === 'image' ? 'View Image' : 'View File'}
                              </Button>
                              <Button
                                onClick={handleDownloadReceipt}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                              >
                                Download
                              </Button>
                            </div>
                          </div>
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

                  {/* FIXED: Show rejection reason properly */}
                  {selectedPayout && selectedPayout.status === "Rejected" && selectedPayout.rejection_reason && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-red-800 mb-4 text-lg flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rejection Details
                      </h3>
                      <div className="bg-red-50 p-4 rounded border border-red-200">
                        <label className="text-sm text-red-600 font-medium block mb-2">Rejection Reason:</label>
                        <p className="text-red-800">{selectedPayout.rejection_reason}</p>
                      </div>
                    </div>
                  )}

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

          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={generatePDFReport}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <MdPictureAsPdf className="w-4 h-4" />
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

      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedPayout?.receipt?.file_url && (
            <div className="relative">
              <IconButton
                onClick={handleCloseImageModal}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1,
                }}
              >
                <MdClose />
              </IconButton>
              <div className="flex flex-col items-center">
                <img
                  src={selectedPayout.receipt.file_url}
                  alt={selectedPayout.receipt.file_name}
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNNTAgNzVMMTAwIDEyNUwxNTAgNzVIMTUwVjEyNUg1MFY3NUg1MFoiIGZpbGw9IiNEOEQ4RDgiLz48L3N2Zz4=';
                  }}
                />
                <div className="mt-4 text-center">
                  <p className="font-medium text-gray-700">{selectedPayout.receipt.file_name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click the download button to save this image
                  </p>
                  <Button
                    onClick={handleDownloadReceipt}
                    className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                    variant="contained"
                  >
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutTable;