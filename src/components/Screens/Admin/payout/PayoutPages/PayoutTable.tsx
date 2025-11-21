import React, { useState } from "react";
import { Paper, Modal, Box, Button, IconButton } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import {  useLocation } from "react-router-dom";

const PayoutTable = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  const data = [
    {
      id: 1,
      agent: "John Doe",
      property: "Luxury 488 Apartment - Leikit Phase I",
      booking: "BK-6789",
      period: "Nov 19: Nov 22 (4 days)",
      calculation_type: "Percentage",
      calculation_detail: "10%",
      amount_detail: "N100,000 x 10%",
      amount: "N9,950",
      gross: "N80,000",
      fee: "N50",
      bank: "GT Bank",
      account_number: "---6789",
      date: "Nov 20, 2025",
      submitted_date: "Submitted Nov 20, 2025",
      status: "Approved",
      receipt: {
        file_name: "payment_receipt_6789.pdf",
        file_size: "2.4 MB",
        uploaded_date: "Nov 21, 2025, 14:30",
        uploaded_by: "Sarah Wilson",
        transaction_id: "TXN-6789ABC",
        payment_date: "Nov 21, 2025"
      }
    },
    {
      id: 2,
      agent: "Jane Smith",
      property: "Studio Apartment - Nejq GRA",
      booking: "BK-9921",
      period: "Nov 19: Nov 22 (4 days)",
      calculation_type: "Markup",
      calculation_detail: "(N8,000/day)",
      amount_detail: "N5,000 x 4 days",
      amount: "N19,950",
      gross: "N20,000",
      fee: "N50",
      bank: "Access Bank",
      account_number: "---1234",
      date: "Nov 21, 2025",
      submitted_date: "Submitted Nov 21, 2025",
      status: "Approved",
      receipt: {
        file_name: "receipt_9921.png",
        file_size: "1.8 MB",
        uploaded_date: "Nov 22, 2025, 09:15",
        uploaded_by: "Mike Johnson",
        transaction_id: "TXN-9921XYZ",
        payment_date: "Nov 22, 2025"
      }
    },
    {
      id: 3,
      agent: "John Doe",
      property: "Executive 388 – Victoria Island",
      booking: "BK-6789",
      period: "Nov 19: Nov 14 (4 days)",
      calculation_type: "Percentage",
      calculation_detail: "6%",
      amount_detail: "N180,000 x 8%",
      amount: "N11,950",
      gross: "N12,000",
      fee: "N50",
      bank: "First Bank",
      account_number: "---5678",
      date: "Nov 19, 2025",
      submitted_date: "Submitted Nov 19, 2025",
      status: "Rejected",
      rejection_reason: "Insufficient documentation provided for verification."
    },
  ];

  const handleViewClick = (rowData: any) => {
    setSelectedPayout(rowData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPayout(null);
  };

  const handleDownloadReceipt = () => {
    // Handle receipt download logic
    console.log("Downloading receipt:", selectedPayout?.receipt?.file_name);
  };

  const handleViewReceipt = () => {
    // Handle view receipt logic
    console.log("Viewing receipt:", selectedPayout?.receipt?.file_name);
  };

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

  return (
    <div>
    
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
              }}
              columns={COLUMNS}
              data={data}
              title=""
              options={{
                paging: !["dashboard", "home"].every((ai) =>
                  pathnames.includes(ai)
                )
                  ? true
                  : false,
                search: true,
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
                searchFieldStyle: {
                  border: "0px",
                  borderRadius: "8px",
                  borderBottom: "1px solid #E8E9ED",
                  width: "250px",
                  height: "40px",
                  backgroundColor: "transparent",
                  marginBottom: "16px",
                },
                searchFieldVariant: "outlined",
                actionsColumnIndex: -1,
                actionsCellStyle: {
                  border: "0",
                },
                exportButton: true,
                minBodyHeight: "400px",
                pageSize: 5,
                pageSizeOptions: [5, 10, 20],
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
            width: '500px',
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

                {/* Uploaded Receipt Section */}
                {selectedPayout.receipt && (
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
                        <p className="text-sm text-green-600 mb-4">{selectedPayout.receipt.file_size}</p>
                        
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
                {selectedPayout.status === "Rejected" && (
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
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default PayoutTable;