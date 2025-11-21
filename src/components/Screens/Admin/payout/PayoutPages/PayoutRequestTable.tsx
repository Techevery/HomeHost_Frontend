// PayoutRequestTable.tsx
import React, { useState } from 'react'
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import { useLocation } from 'react-router-dom';
import { MdClose, MdCheck, MdCancel, MdCloudUpload } from 'react-icons/md';

interface RowData {
  agent: string;
  property: string;
  booking: string;
  calculation: string;
  amount: string;
  bank: string;
  date: string;
  status: string;
}

const PayoutRequestTable = () => {
    const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const url = useLocation();
    const { pathname } = url;
    const pathnames = pathname.split("/").filter((x) => x);
    
    const data: RowData[] = [
      {
        agent: "John Doe",
        property: "Luxury 48R Apartment - Leikli Phase I",
        booking: "BK-6788",
        calculation: "Percentage\n8%\nMSB,000 x 8%\n\nMarkup\n(MS,000/day)\nMS,000 x 4 days",
        amount: "N9,950\nGross : MS,000\nFee: MSD",
        bank: "GT Bank\n9789",
        date: "Nov 21, 2025\nSubmitted Nov 21, 2025",
        status: "Pending"
      },
      {
        agent: "Jane Smith",
        property: "Studio Apartment - Neja GRA",
        booking: "BK-9921",
        calculation: "Percentage\n8%\nMSB,000 x 8%\n\nMarkup\n(MS,000/day)\nMS,000 x 4 days",
        amount: "N19,950\nGross : MS,000\nFee: NSD",
        bank: "Access Bank\n1234",
        date: "Nov 19, 2025\nSubmitted Nov 19, 2025",
        status: "Pending"
      },
      {
        agent: "Mike Johnson",
        property: "38R Duplex - Victoria Island",
        booking: "BK-1205",
        calculation: "Percentage\n8%\nMSB,000 x 8%\n\nMarkup\n(MS,000/day)\nMS,000 x 4 days",
        amount: "N11,950\nGross : MS,000\nFee: NSD",
        bank: "First Bank\n5678",
        date: "Nov 18, 2025\nSubmitted Nov 18, 2025",
        status: "Pending"
      }
    ];

    const handleApproveClick = (rowData: RowData) => {
        setSelectedRow(rowData);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (rowData: RowData) => {
        setSelectedRow(rowData);
        setIsRejectModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsApproveModalOpen(false);
        setIsRejectModalOpen(false);
        setSelectedRow(null);
        setRejectReason('');
        setUploadedFile(null);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleApproveSubmit = () => {
        // Handle approve submission here
        console.log('Approving payout for:', selectedRow, 'with file:', uploadedFile);
        handleCloseModals();
    };

    const handleRejectSubmit = () => {
        // Handle reject submission here
        console.log('Rejecting payout for:', selectedRow, 'Reason:', rejectReason);
        handleCloseModals();
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
              <div key={index} className={index === 0 ? 'font-bold text-base' : 'text-sm text-gray-600'}>
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
              <div key={index} className={index === 0 ? 'font-medium' : 'text-gray-600'}>
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
            {rowData.date.split('\n').map((line: string, index: number) => (
              <div key={index} className={index === 0 ? 'font-medium' : 'text-gray-500 text-xs'}>
                {line}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "ACTIONS",
        field: "status" as const,
        cellStyle: { textAlign: 'center' as const },
        render: (rowData: RowData) => (
          <div className="flex flex-col gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              rowData.status === 'Approved' ? 'bg-green-100 text-green-800' :
              rowData.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {rowData.status}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleApproveClick(rowData)}
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                <MdCheck className="w-4 h-4" />
                Approve
              </button>
              <button 
                onClick={() => handleRejectClick(rowData)}
                className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                <MdCancel className="w-4 h-4" />
                Reject
              </button>
            </div>
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
      <div className="bg-white rounded-[20px] p-6">
        {/* Approve Modal */}
        {isApproveModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Approve Payout</h3>
                <button 
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {selectedRow && (
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
                        <p className="text-sm text-gray-600">Booking ID</p>
                        <p className="font-medium">{selectedRow.booking}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">{selectedRow.amount.split('\n')[0]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium">{selectedRow.bank.split('\n')[1]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bank</p>
                        <p className="font-medium">{selectedRow.bank.split('\n')[0]}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Upload Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Upload Document</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <MdCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        {uploadedFile ? 'File selected: ' + uploadedFile.name : 'Click to upload document'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPG, PNG, PDF, DOC (Max: 10MB)
                      </p>
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 text-sm">
                        ✓ {uploadedFile.name} ready for upload
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Please upload the payment receipt or relevant document before approving this payout.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModals}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveSubmit}
                  disabled={!uploadedFile}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${
                    uploadedFile 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit & Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Reject Payout</h3>
                <button 
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {selectedRow && (
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
                        <p className="font-medium">{selectedRow.amount.split('\n')[0]}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Reason for Rejection</h4>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this payout request..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
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
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${
                    rejectReason.trim() 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Rejection
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
                searchFieldStyle: {
                  border: "0px",
                  borderRadius: "0px",
                  borderBottom: "1px solid #E8E9ED",
                  width: "192px",
                  height: "36px",
                  backgroundColor: "transparent",
                },
                searchFieldVariant: "standard",
                actionsColumnIndex: -1,
                actionsCellStyle: {
                  border: "0",
                  paddingLeft: "2%",
                },
                exportButton: false,
                minBodyHeight: "400px",
                showTitle: false,
              }}
            />
          </div>
        </ThemeProvider>
      </div>
    );
}

export default PayoutRequestTable;