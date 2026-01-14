// PayoutRequestTable.tsx - Updated version
import React, { useState, useEffect } from 'react'
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import { useLocation } from 'react-router-dom';
import { MdClose, MdCheck, MdCancel, MdCloudUpload, MdFilterList, MdSearch, MdAttachMoney, MdAdd, MdToggleOn, MdToggleOff } from 'react-icons/md';
import useWalletStore, { PayoutStatus } from '../../../../../stores/payoutStore';
import { ToastContainer, toast } from "react-toastify";

interface RowData {
  id: string;
  agent: string;
  property: string;
  booking: string;
  calculation: string;
  amount: string;
  bank: string;
  date: string;
  status: string;
  originalStatus: PayoutStatus;
  grossAmount: number;
  agentAmount: number;
  fee: number;
  charges: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  // Add these for charge status management
  chargeId?: string;
  chargeStatus?: "active" | "inactive";
  chargeDescription?: string;
  // Add action status to track what action was performed
  actionStatus?: "pending" | "approved" | "rejected";
}

interface ChargeData {
  description: string;
  amount: number;
  status?: "active" | "inactive";
}

const PayoutRequestTable = () => {
    const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveRemark, setApproveRemark] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');
    const [filteredData, setFilteredData] = useState<RowData[]>([]);
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFullScreenPreviewOpen, setIsFullScreenPreviewOpen] = useState(false);
    
    // Add charge modal states
    const [chargeDescription, setChargeDescription] = useState('');
    const [chargeAmount, setChargeAmount] = useState<string>('');
    const [charges, setCharges] = useState<ChargeData[]>([]);
    const [totalCharges, setTotalCharges] = useState<number>(0);
    const [chargeStatus, setChargeStatus] = useState<"active" | "inactive">("active");
    
    // Add charge status management states
    const [selectedCharge, setSelectedCharge] = useState<{
      chargeId: string;
      currentStatus: "active" | "inactive";
      description?: string;
      amount?: number;
    } | null>(null);
    const [isChargeStatusModalOpen, setIsChargeStatusModalOpen] = useState(false);
    const [newChargeStatus, setNewChargeStatus] = useState<"active" | "inactive">("active");

    // Track action status for rows
    const [actionStatusMap, setActionStatusMap] = useState<Record<string, "pending" | "approved" | "rejected">>({});

    const { 
      payouts, 
      isLoading, 
      error, 
      isProcessingPayout, 
      isProcessingCharges, 
      getAllPayouts, 
      confirmPayout,
      rejectPayout,
      createCharges,
      updateChargeStatus,
      clearError 
    } = useWalletStore();

    const url = useLocation();
    const { pathname } = url;
    const pathnames = pathname.split("/").filter((x) => x);
    
    useEffect(() => {
      getAllPayouts();
    }, [getAllPayouts]);

    const transformPayoutToRowData = (payout: any): RowData => {
      const transaction = payout.transaction || {};
      const agent = payout.agent || {};
      
      // Get payout amount with fallback - use payout.amount directly from backend
      const payoutAmount = payout.amount || 0;
      const grossAmount = transaction.amount || payoutAmount;
      const agentPercentage = transaction.agentPercentage || 0;
      
      // Calculate agent amount - use payout.amount from backend as it's already calculated
      const agentAmount = payoutAmount;
      const fee = payoutAmount;
      
      // Get charges from payout data
      const charges = payout.charges || 0;

      let calculation = '';
      
      if (agentPercentage > 0) {
        calculation += `Percentage\n${agentPercentage}%\n₦${grossAmount.toLocaleString()} x ${agentPercentage}%\n\n`;
      }
      
      if (transaction.mockupPrice && transaction.mockupPrice > 0) {
        calculation += `Markup\n(₦${transaction.mockupPrice}/day)\n₦${transaction.mockupPrice} x 4 days`;
      } else if (calculation.endsWith('\n\n')) {
        calculation = calculation.slice(0, -2); 
      }

      // If no calculation method, show amount directly
      if (!calculation) {
        calculation = `Amount\n₦${grossAmount.toLocaleString()}`;
      }

      // Format amount display with charges
      const netFee = fee - charges;
      const amount = `₦${agentAmount.toLocaleString()}\nGross: ₦${grossAmount.toLocaleString()}\nFee: ₦${netFee.toLocaleString()}${charges > 0 ? ` (-₦${charges.toLocaleString()})` : ''}`;

      // Bank details - using payout data directly (not from agent object)
      const bankName = payout.bankName || 'Bank not specified';
      const accountNumber = payout.accountNumber || 'Account not specified';
      const accountName = payout.accountName || agent.name || 'Name not available';
      
      const bankDetails = `${bankName}\n${accountNumber}\n${accountName}`;

      // Date formatting
      const createdDate = new Date(payout.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const date = `${createdDate}`;

      // Map status
      const statusMap: Record<PayoutStatus, string> = {
        [PayoutStatus.PENDING]: 'Pending',
        [PayoutStatus.SUCCESS]: 'Approved',
        [PayoutStatus.FAILED]: 'Rejected',
        [PayoutStatus.CANCELLED]: 'Rejected'
      };

      return {
        id: payout.id,
        agent: agent.name || 'Unknown Agent',
        property: transaction.apartment?.name || 'Unknown Property',
        booking: payout.reference ? `REF-${payout.reference}` : `REF-${payout.id.slice(-8).toUpperCase()}`,
        calculation,
        amount,
        bank: bankDetails,
        date,
        status: statusMap[payout.status as PayoutStatus] || 'Pending',
        originalStatus: payout.status as PayoutStatus,
        grossAmount,
        agentAmount,
        fee,
        charges,
        bankName: payout.bankName,
        accountNumber: payout.accountNumber,
        accountName: payout.accountName || agent.name,
        // Add charge info - you may need to adjust based on your actual data structure
        chargeId: payout.chargeId, // Adjust this based on your actual data
        chargeStatus: payout.chargeStatus || "active", // Adjust this based on your actual data
        chargeDescription: payout.chargeDescription, // Adjust this based on your actual data
        // Get action status from our tracking map
        actionStatus: actionStatusMap[payout.id] || "pending"
      };
    };

    
    const data: RowData[] = payouts.map(transformPayoutToRowData);

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
          row.status.toLowerCase().includes(searchLower)
        );
      }

      setFilteredData(result);
    }, [payouts, statusFilter, searchText, actionStatusMap]);

    const handleApproveClick = (rowData: RowData) => {
        setSelectedRow(rowData);
        setIsApproveModalOpen(true);
        setApproveRemark('');
        setUploadedFile(null);
        // Update action status to show processing
        setActionStatusMap(prev => ({
          ...prev,
          [rowData.id]: "approved"
        }));
    };

    const handleRejectClick = (rowData: RowData) => {
        setSelectedRow(rowData);
        setIsRejectModalOpen(true);
        setRejectReason('');
        // Update action status to show processing
        setActionStatusMap(prev => ({
          ...prev,
          [rowData.id]: "rejected"
        }));
    };

    const handleOpenAddChargeModal = () => {
      setChargeDescription('');
      setChargeAmount('');
      setCharges([]);
      setTotalCharges(0);
      setChargeStatus('active');
      setIsChargeModalOpen(true);
    };

    // New function for updating charge status
    const handleUpdateChargeStatus = async () => {
      if (!selectedCharge) return;

      try {
        await updateChargeStatus({
          chargeId: selectedCharge.chargeId,
          status: newChargeStatus
        });

        toast.success(`Charge ${newChargeStatus === "active" ? "activated" : "deactivated"} successfully!`);
        
        // Refresh data
        await getAllPayouts();
        
        // Close modal
        setIsChargeStatusModalOpen(false);
        setSelectedCharge(null);
        
      } catch (error) {
        toast.error('Failed to update charge status. Please try again.');
      }
    };

    // Function to open charge status modal
    const handleOpenChargeStatusModal = (rowData: RowData) => {
      // You need to get the actual charge data from your row
      // This is just an example - adjust based on your actual data structure
      setSelectedCharge({
        chargeId: rowData.chargeId || `charge-${rowData.id}`,
        currentStatus: rowData.chargeStatus || "active",
        description: rowData.chargeDescription || "Service Charge",
        amount: rowData.charges
      });
      setNewChargeStatus(rowData.chargeStatus || "active");
      setIsChargeStatusModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsApproveModalOpen(false);
        setIsRejectModalOpen(false);
        setIsChargeModalOpen(false);
        setIsChargeStatusModalOpen(false);
        setSelectedRow(null);
        setSelectedCharge(null);
        setRejectReason('');
        setApproveRemark('');
        setUploadedFile(null);
        setChargeDescription('');
        setChargeAmount('');
        setCharges([]);
        setTotalCharges(0);
        setChargeStatus('active');
        clearError();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
              toast.error('File size must be less than 10MB');
                return;
            }
            
            // Check file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid file type. Please upload JPG, PNG, PDF, or DOC files.');
                return;
            }
            
            setUploadedFile(file);
        }
    };

    
    const handleApproveSubmit = async () => {
        if (!selectedRow) return;

        try {
            const files = uploadedFile ? [uploadedFile] : [];
            
            // Create remark or use user input
            const remark = approveRemark.trim() || `Payout approved for ${selectedRow.agent}. Amount: ₦${selectedRow.agentAmount.toLocaleString()}`;
            
            await confirmPayout({
                payoutId: selectedRow.id,
                remark: remark,
                files
            });

          toast.success('Payout approved successfully!');
          handleCloseModals();
            
            // Refresh the payouts list
            await getAllPayouts();
            
        } catch (error) {
          // Reset action status on error
          setActionStatusMap(prev => ({
            ...prev,
            [selectedRow.id]: "pending"
          }));
          toast.error('Failed to approve payout. Please try again.');
        }
    };

    // FIXED: Using reasson to match backend expectation
    const handleRejectSubmit = async () => {
        if (!selectedRow || !rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            // Backend expects 'reasson' (typo)
            await rejectPayout({
                payoutId: selectedRow.id,
                reasson: rejectReason  // Use 'reasson' not 'reason'
            });

            toast.success('Payout rejected successfully!');
            handleCloseModals();
            
            // Refresh the payouts list
            await getAllPayouts();
            
        } catch (error: any) {
            // Reset action status on error
            setActionStatusMap(prev => ({
              ...prev,
              [selectedRow.id]: "pending"
            }));
            console.error('Reject error:', error);
            toast.error(error.message || 'Failed to reject payout. Please try again.');
        }
    };
    
    const handleAddCharge = () => {
      if (!chargeDescription.trim() || !chargeAmount.trim()) {
        toast.error('Please enter both description and amount');
        return;
      }

      const amount = parseFloat(chargeAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid positive amount');
        return;
      }

      const newCharge: ChargeData = {
        description: chargeDescription.trim(),
        amount,
        status: chargeStatus
      };

      setCharges([...charges, newCharge]);
      setTotalCharges(totalCharges + amount);
      
      // Clear form
      setChargeDescription('');
      setChargeAmount('');
    };

    const handleRemoveCharge = (index: number) => {
      const removedCharge = charges[index];
      const newCharges = charges.filter((_, i) => i !== index);
      setCharges(newCharges);
      setTotalCharges(totalCharges - removedCharge.amount);
    };
    
    const handleSubmitCharges = async () => {
      if (charges.length === 0) {
        toast.error('Please add at least one charge');
        return;
      }

      try {
        // Create all charges - backend expects description and amount
        for (const charge of charges) {
          await createCharges({
            description: charge.description,
            amount: charge.amount
          });
        }

        toast.success('Charges created successfully!');
        
        handleCloseModals();
        
        // Refresh the payouts list
        await getAllPayouts();
        
      } catch (error) {
        toast.error('Failed to create charges. Please try again.');
      }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const clearSearch = () => {
        setSearchText('');
    };

    // Status filter options
    const statusFilterOptions = [
      { value: 'ALL' as const, label: 'All Status', count: data.length },
      { value: PayoutStatus.PENDING, label: 'Pending', count: data.filter(row => row.originalStatus === PayoutStatus.PENDING).length },
      { value: PayoutStatus.SUCCESS, label: 'Approved', count: data.filter(row => row.originalStatus === PayoutStatus.SUCCESS).length },
      { value: PayoutStatus.CANCELLED, label: 'Rejected', count: data.filter(row => row.originalStatus === PayoutStatus.CANCELLED).length },
    ];

    // Helper function to get status badge text based on action
    const getStatusBadgeText = (rowData: RowData) => {
      // If we have an action status, use that
      if (rowData.actionStatus === "approved") {
        return "Approved";
      } else if (rowData.actionStatus === "rejected") {
        return "Rejected";
      }
      // Otherwise use the original status
      return rowData.status;
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (rowData: RowData) => {
      const status = rowData.actionStatus === "approved" ? "approved" : 
                    rowData.actionStatus === "rejected" ? "rejected" : 
                    rowData.status.toLowerCase();
      
      if (status === 'approved') {
        return 'bg-green-100 text-green-800';
      } else if (status === 'rejected') {
        return 'bg-red-100 text-red-800';
      } else {
        return 'bg-yellow-100 text-yellow-800';
      }
    };

    const COLUMNS = [
      {
        title: "AGENT & PROPERTY",
        field: "agent" as const,
        cellStyle: { paddingLeft: "2%" },
        render: (rowData: RowData) => (
          <div className="py-3">
            <div className="font-semibold text-[#333]">{rowData.agent}</div>
            <div className="text-sm text-gray-600">{rowData.property}</div>
            <div className="text-sm text-gray-500">Booking: {rowData.booking}</div>
            {/* Show charge status if available */}
            {rowData.chargeId && (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                  rowData.chargeStatus === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {rowData.chargeStatus === "active" ? (
                    <MdToggleOn className="w-3 h-3 mr-1" />
                  ) : (
                    <MdToggleOff className="w-3 h-3 mr-1" />
                  )}
                  Charge: {rowData.chargeStatus || "active"}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Calculation",
        field: "calculation" as const,
        cellStyle: {  },
        render: (rowData: RowData) => (
          <div className="whitespace-pre-line text-sm">
            {rowData.calculation.split('\n\n').map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-3' : ''}>
                {section.split('\n').map((line, lineIndex) => (
                  <div 
                    key={lineIndex} 
                    className={
                      lineIndex === 0 ? 'font-semibold text-gray-800' : 
                      line.includes('(') ? 'text-gray-500 text-xs' : 
                      'text-gray-700'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Amount",
        field: "amount" as const,
        cellStyle: {  },
        render: (rowData: RowData) => (
          <div className="whitespace-pre-line text-sm font-semibold">
            {rowData.amount.split('\n').map((line: string, index: number) => (
              <div key={index} className={
                index === 0 ? 'font-bold text-base' : 
                index === 1 ? 'text-sm text-gray-600' : 
                rowData.charges > 0 ? 'text-sm text-red-600' : 'text-sm text-gray-600'
              }>
                {line}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Bank details",
        field: "bank" as const,
        cellStyle: {  },
        render: (rowData: RowData) => (
          <div className="whitespace-pre-line text-sm">
            {rowData.bank.split('\n').map((line: string, index: number) => (
              <div key={index} className={
                index === 0 ? 'font-medium text-gray-800' : 
                index === 1 ? 'font-semibold text-green-600' : 
                'text-gray-500 text-xs'
              }>
                {line}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Date",
        field: "date" as const,
        cellStyle: {  },
        render: (rowData: RowData) => (
          <div className="whitespace-pre-line text-sm">
            <div className="font-medium">{rowData.date}</div>
          </div>
        ),
      },
      {
        title: "STATUS & ACTIONS",
        field: "status" as const,
        cellStyle: { textAlign: 'center' as const },
        render: (rowData: RowData) => (
          <div className="flex flex-col gap-2">
            {/* Status Badge - Shows action status instead of just "Pending" */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(rowData)}`}>
              {getStatusBadgeText(rowData)}
            </div>
            
            {/* Action Buttons - Only show for pending payouts */}
            {rowData.originalStatus === PayoutStatus.PENDING && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleApproveClick(rowData)}
                    disabled={isProcessingPayout || rowData.actionStatus !== "pending"}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <MdCheck className="w-4 h-4" />
                    {rowData.actionStatus === "approved" ? 'Approved' : 
                     isProcessingPayout ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleRejectClick(rowData)}
                    disabled={isProcessingPayout || rowData.actionStatus !== "pending"}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <MdCancel className="w-4 h-4" />
                    {rowData.actionStatus === "rejected" ? 'Rejected' : 
                     isProcessingPayout ? 'Processing...' : 'Reject'}
                  </button>
                </div>
                
                {/* Manage Charge Status Button - Show if charge exists */}
                {rowData.chargeId && (
                  <button 
                    onClick={() => handleOpenChargeStatusModal(rowData)}
                    disabled={isProcessingCharges}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                      rowData.chargeStatus === "active" 
                        ? "bg-yellow-600 text-white hover:bg-yellow-700" 
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {rowData.chargeStatus === "active" ? (
                      <MdToggleOn className="w-4 h-4" />
                    ) : (
                      <MdToggleOff className="w-4 h-4" />
                    )}
                    {rowData.chargeStatus === "active" ? "Deactivate" : "Activate"} Charge
                  </button>
                )}
              </div>
            )}
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
    if (isLoading && payouts.length === 0) {
      return (
        <div className="bg-white rounded-[20px] p-6 flex items-center justify-center h-64">
          <div className="text-gray-600">Loading payouts...</div>
        </div>
      );
    }

    // Show error state
    if (error && payouts.length === 0) {
      return (
        <div className="bg-white rounded-[20px] p-6">
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

    // Show empty state
    if (payouts.length === 0 && !isLoading) {
      return (
        <div className="bg-white rounded-[20px] p-6 text-center">
          <div className="text-gray-600 text-lg mb-4">No payout requests found</div>
          <button 
            onClick={getAllPayouts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }

    return (
      
      <div className="bg-white rounded-[20px] p-6">
      
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === option.value
                      ? option.value === 'ALL' 
                        ? 'bg-blue-600 text-white'
                        : option.value === PayoutStatus.PENDING
                        ? 'bg-yellow-600 text-white'
                        : option.value === PayoutStatus.SUCCESS
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  {option.label} 
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === option.value 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'}`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Charge Status Modal */}
        {isChargeStatusModalOpen && selectedCharge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Update Charge Status</h3>
                <button 
                  onClick={() => {
                    setIsChargeStatusModalOpen(false);
                    setSelectedCharge(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isProcessingCharges}
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Charge Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Charge ID</p>
                      <p className="font-medium">{selectedCharge.chargeId}</p>
                    </div>
                    {selectedCharge.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{selectedCharge.description}</p>
                      </div>
                    )}
                    {selectedCharge.amount && (
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">₦{selectedCharge.amount.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCharge.currentStatus === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"}`}>
                          {selectedCharge.currentStatus === "active" ? (
                            <span className="flex items-center">
                              <MdToggleOn className="w-4 h-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <MdToggleOff className="w-4 h-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Set New Status</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setNewChargeStatus("active")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${newChargeStatus === "active"
                            ? "bg-green-50 border-green-500 text-green-700" 
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                        disabled={isProcessingCharges}
                      >
                        <MdToggleOn className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Active</div>
                          <div className="text-xs">Charge will be applied</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setNewChargeStatus("inactive")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${newChargeStatus === "inactive"
                            ? "bg-gray-50 border-gray-500 text-gray-700" 
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                        disabled={isProcessingCharges}
                      >
                        <MdToggleOff className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Inactive</div>
                          <div className="text-xs">Charge will be suspended</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${newChargeStatus === "active" 
                    ? "bg-green-50 border border-green-200 text-green-800" 
                    : "bg-gray-50 border border-gray-200 text-gray-800"}`}>
                  <p className="text-sm">
                    {newChargeStatus === "active" 
                      ? "Activating this charge will apply it to future payouts." 
                      : "Deactivating this charge will suspend it from future payouts."}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsChargeStatusModalOpen(false);
                    setSelectedCharge(null);
                  }}
                  disabled={isProcessingCharges}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateChargeStatus}
                  disabled={isProcessingCharges || newChargeStatus === selectedCharge.currentStatus}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${!isProcessingCharges && newChargeStatus !== selectedCharge.currentStatus
                      ? newChargeStatus === "active" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gray-600 hover:bg-gray-700" 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {isProcessingCharges 
                    ? 'Processing...' 
                    : `Set as ${newChargeStatus === "active" ? "Active" : "Inactive"}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Charge Modal */}
        {isChargeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Create New Charge</h3>
                <button 
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isProcessingCharges}
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Add New Charge</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={chargeDescription}
                        onChange={(e) => setChargeDescription(e.target.value)}
                        placeholder="e.g., Service fee, Processing fee, etc."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                        disabled={isProcessingCharges}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₦)
                      </label>
                      <input
                        type="number"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                        disabled={isProcessingCharges}
                      />
                    </div>

                    {/* Charge Status Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Charge Status
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setChargeStatus("active")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${chargeStatus === "active"
                              ? "bg-green-50 border-green-500 text-green-700" 
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                          disabled={isProcessingCharges}
                        >
                          <MdToggleOn className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">Active</div>
                            <div className="text-xs">Charge will be applied</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setChargeStatus("inactive")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${chargeStatus === "inactive"
                              ? "bg-gray-50 border-gray-500 text-gray-700" 
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                          disabled={isProcessingCharges}
                        >
                          <MdToggleOff className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">Inactive</div>
                            <div className="text-xs">Charge will be suspended</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddCharge}
                      disabled={!chargeDescription.trim() || !chargeAmount.trim() || isProcessingCharges}
                      className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <MdAdd className="w-5 h-5" />
                      Add Charge to List
                    </button>
                  </div>
                </div>

                {/* Charges List */}
                {charges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">Charges to Create</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {charges.map((charge, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{charge.description}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${charge.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'}`}>
                                {charge.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">₦{charge.amount.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveCharge(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            disabled={isProcessingCharges}
                          >
                            <MdClose className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total Charges */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Total Charges:</span>
                        <span className="font-bold text-xl text-red-600">₦{totalCharges.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800 text-sm">
                    These charges will be created and can be activated/deactivated later. Active charges will be applied to payouts.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModals}
                  disabled={isProcessingCharges}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCharges}
                  disabled={charges.length === 0 || isProcessingCharges}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${charges.length > 0 && !isProcessingCharges
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {isProcessingCharges ? 'Processing...' : 'Create Charges'}
                </button>
              </div>
            </div>
          </div>
        )}

  {isApproveModalOpen && selectedRow && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Approve Payout</h3>
        <button 
          onClick={handleCloseModals}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isProcessingPayout}
        >
          <MdClose className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Payout Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Payout Information</h4>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agent Name</p>
                  <p className="font-medium text-gray-800">{selectedRow.agent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Property</p>
                  <p className="font-medium text-gray-800">{selectedRow.property}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                  <p className="font-medium text-gray-800">{selectedRow.booking}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                  <p className="font-medium text-green-600">₦{selectedRow.agentAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Number</p>
                    <p className="font-medium text-gray-800">{selectedRow.accountNumber || 'Not available'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                      <p className="font-medium text-gray-800">{selectedRow.bankName || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Name</p>
                      <p className="font-medium text-gray-800">{selectedRow.accountName || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Remark and Upload */}
          <div>
            {/* Remark Input Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Approval Remark</h4>
              <textarea
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="Enter approval remark... This will be included in the notification to the agent."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                disabled={isProcessingPayout}
              />
            </div>

            {/* Document Upload Section */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Upload Payment Proof</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isProcessingPayout}
                />
                <label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center">
                  <MdCloudUpload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm mb-1">
                    {uploadedFile ? 'File selected: ' + uploadedFile.name : 'Click to upload payment proof'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, PDF, DOC (Max: 10MB)
                  </p>
                </label>
              </div>
              
              {/* Image/File Preview */}
              {uploadedFile && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {uploadedFile.type.startsWith('image/') ? (
                      <div className="relative">
                        <div 
                          className="w-full h-48 cursor-pointer overflow-hidden bg-gray-100"
                          onClick={() => setIsFullScreenPreviewOpen(true)}
                        >
                          <img 
                            src={URL.createObjectURL(uploadedFile)} 
                            alt="Preview" 
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => setIsFullScreenPreviewOpen(true)}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md"
                            type="button"
                            title="View full screen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                            type="button"
                            title="Remove file"
                          >
                            <MdClose className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg mr-3">
                            <span className="text-blue-600 font-bold">
                              {uploadedFile.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-600">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                          type="button"
                        >
                          <MdClose className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <MdCheck className="w-4 h-4 mr-1" />
                    File ready for upload
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            Approving this payout will notify the agent and mark this transaction as completed. The payment proof will be attached to the notification.
          </p>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
        <button
          onClick={handleCloseModals}
          disabled={isProcessingPayout}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleApproveSubmit}
          disabled={isProcessingPayout}
          className={`px-6 py-2 rounded-lg text-white transition-colors ${!isProcessingPayout
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          {isProcessingPayout ? 'Processing...' : 'Approve Payout'}
        </button>
      </div>
    </div>
  </div>
)}

{/* Full Screen Image Preview Modal */}
{isFullScreenPreviewOpen && uploadedFile && uploadedFile.type.startsWith('image/') && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4">
    <div className="relative w-full h-full flex items-center justify-center">
      <button
        onClick={() => setIsFullScreenPreviewOpen(false)}
        className="absolute top-4 right-4 bg-white text-gray-800 p-3 rounded-full hover:bg-gray-100 transition-colors z-10 shadow-lg"
        type="button"
      >
        <MdClose className="w-6 h-6" />
      </button>
      
      <div className="max-w-full max-h-full overflow-auto">
        <img 
          src={URL.createObjectURL(uploadedFile)} 
          alt="Full screen preview" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">
          {uploadedFile.name} • {(uploadedFile.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  </div>
)}

        {/* Reject Modal */}
        {isRejectModalOpen && selectedRow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Reject Payout</h3>
                <button 
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isProcessingPayout}
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Payout Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Agent Name</p>
                      <p className="font-medium">{selectedRow.agent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <p className="font-medium">{selectedRow.property}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">₦{selectedRow.agentAmount.toLocaleString()}</p>
                    </div>
                   
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Reason for Rejection *</h4>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this payout request..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                    required
                    disabled={isProcessingPayout}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This reason will be sent to the agent.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    This action cannot be undone. The agent will be notified of the rejection.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModals}
                  disabled={isProcessingPayout}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim() || isProcessingPayout}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${rejectReason.trim() && !isProcessingPayout
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isProcessingPayout ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ThemeProvider theme={defaultMaterialTheme}>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />

          <div className="w-full overflow-scroll">
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

                      {/* Button Group - Filter and Add Charge */}
                      <div className="flex gap-2">
                        {/* Filter Button */}
                        <button
                          onClick={() => setShowStatusFilter(!showStatusFilter)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showStatusFilter || statusFilter !== 'ALL'
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

                        {/* Add Charge Button */}
                        <button 
                          onClick={handleOpenAddChargeModal}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                         
                          Add Charge
                        </button>
                      </div>
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
                  color: "#474E70",
                  backgroundColor: "transparent",
                  fontWeight: 400,
                  fontSize: "14px",
                  padding: "5px",
                  borderBottom: "1px solid #E8E9ED",
                },
                headerStyle: {
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  border: 0,
                  borderBottom: "1px solid #E8E9ED",
                  paddingLeft: "2%",
                },
                actionsColumnIndex: -1,
                actionsCellStyle: {
                  border: "0",
                  paddingLeft: "2%",
                },
                exportButton: false,
                minBodyHeight: "400px",
                showTitle: false,
                searchAutoFocus: false,
                toolbarButtonAlignment: "left",
              }}
            />
          </div>
        </ThemeProvider>
      </div>
    );
}

export default PayoutRequestTable