import React, { useEffect, useState } from "react";
import { Paper, Modal, Box, Typography, Chip, IconButton } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { Link, useLocation } from "react-router-dom";
import useBookingStore from "../../../../stores/bookingStore";
import CloseIcon from '@mui/icons-material/Close';

const AdminBooking = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const { bookings, loading, error, fetchBookings } = useBookingStore();
  
  // Use the correct type from your store
  type BookingType = typeof bookings[0];
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  console.log({ bookings });
  console.log({ fetchBookings });

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: any) => {
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(numAmount || 0);
  };

  const handleRowClick = (event: any, rowData: any) => {
    const originalBooking = bookings.find(booking => booking.id === rowData.id);
    setSelectedBooking(originalBooking || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status: string = "") => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "successful":
      case "completed":
        return "#1ED75A";
      case "failed":
      case "cancelled":
        return "#FF0909";
      case "booked":
      case "pending":
        return "#FFA500";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string = "") => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "successful":
      case "completed":
        return "Successful";
      case "failed":
      case "cancelled":
        return "Failed";
      case "booked":
      case "pending":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  const tableData = bookings.map((booking) => ({
    id: booking.id,
    customer: booking.guest_name || "N/A",
    apartment_booked: booking.apartment?.name || "N/A",
    date: formatDate(booking.created_at || ""),
    phone_number: booking.guest_phone || booking.phone_number || "N/A",
    check_in: formatDate(booking.booking_start_date || ""),
    check_out: formatDate(booking.booking_end_date || ""),
    apartment_agent: booking.apartment?.agent || "N/A",
    status: booking.status || "Unknown",
    transaction_status: booking.transaction?.status || "N/A",
    amount: booking.amount || booking.transaction?.amount || "N/A",
  }));

  const COLUMNS = [
    {
      title: "Customer",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex justify-center">{rowData.customer}</div>
      ),
    },
    {
      title: "Apartment Booked",
      field: "apartment_booked",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex justify-center">{rowData.apartment_booked}</div>
      ),
    },
    {
      title: "Booking Date",
      field: "date",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.date}</div>,
    },
    {
      title: "Phone Number",
      field: "phone_number",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.phone_number}</div>,
    },
    {
      title: "Check in",
      field: "check_in",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.check_in}</div>,
    },
    {
      title: "Check out",
      field: "check_out",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.check_out}</div>,
    },
    {
      title: "Apartment Agent",
      field: "apartment_agent",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => <div>{rowData.apartment_agent}</div>,
    },
    {
      title: "Status",
      field: "status",
      cellStyle: {},
      render: (rowData: any) => (
        <div style={{ color: getStatusColor(rowData.status) }}>
          {rowData.status === "Successful" || rowData.status === "successful" ? (
            <div className="text-[#1ED75A]">Successful</div>
          ) : rowData.status === "Failed" || rowData.status === "failed" ? (
            <div className="text-[#FF0909]">Failed</div>
          ) : (
            <div className="text-[#FFA500]">{rowData.status}</div>
          )}
        </div>
      ),
    },
  ];

  const defaultMaterialTheme = createTheme({
    palette: {},
  });

  if (loading) {
    return (
      <div className="bg-[#E5E5E5] h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#E5E5E5] h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E5E5E5] min-h-screen p-6">
      <h4 className="text-[20px] font-bold mb-6">Booking Details</h4>
      
      {/* Stats Cards */}
      <div className="bg-white rounded-[20px] p-5 mb-6">
        <div className="flex gap-12">
          <div className="bg-[#4EC368] rounded-[12px] text-white px-8 py-3">
            Successful (
            {
              tableData.filter(
                (item) =>
                  item.status === "Successful" || item.status === "successful",
              ).length
            }
            )
          </div>
          <div className="bg-[#D84A4A] rounded-[12px] text-white px-14 py-3">
            Failed (
            {
              tableData.filter(
                (item) => item.status === "Failed" || item.status === "failed",
              ).length
            }
            )
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex w-full items-center justify-center">
        <div className="w-full">
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
                data={tableData}
                title=""
                onRowClick={handleRowClick}
                options={{
                  paging: !["dashboard", "home"].every((ai) =>
                    pathnames.includes(ai),
                  )
                    ? true
                    : false,
                  search: true,
                  rowStyle: {
                    color: "#474E70",
                    backgroundColor: "transparent",
                    fontWeight: 400,
                    fontSize: "16px",
                    padding: "5px",
                    cursor: "pointer",
                  },
                  headerStyle: {
                    color: "#000",
                    fontWeight: 600,
                    fontSize: "16px",
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
                  exportButton: true,
                  minBodyHeight: "400px",
                }}
              />
            </div>
          </ThemeProvider>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="booking-details-modal"
        aria-describedby="booking-details-description"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Box 
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: 24,
            p: 0,
          }}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-16 px-6 py-4 flex justify-between items-center">
            <Typography variant="h5" className="font-bold text-gray-800">
              Booking Details
            </Typography>
            <IconButton 
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </div>

          {selectedBooking && (
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Typography variant="body2" color="textSecondary" className="mb-1">
                    BOOKING ID
                  </Typography>
                  <Typography variant="body1" className="font-mono text-gray-700">
                    {selectedBooking.id}
                  </Typography>
                </div>
                <div className="flex justify-end">
                  <Chip 
                    label={getStatusText(selectedBooking.status)} 
                    style={{ 
                      backgroundColor: getStatusColor(selectedBooking.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      padding: '8px 16px',
                      height: '32px'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography variant="h6" className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Customer Information
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Guest Name</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.guest_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Phone Number</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.guest_phone || selectedBooking.phone_number || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Email</span>
                        <span className="font-semibold text-gray-800 text-sm">{selectedBooking.transaction?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography variant="h6" className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Booking Information
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Booking Date</span>
                        <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedBooking.created_at || "")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Check-in</span>
                        <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedBooking.booking_start_date || "")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Check-out</span>
                        <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedBooking.booking_end_date || "")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Duration</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.duration_days || selectedBooking.booking_period?.duration_days || 0} day(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Apartment Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography variant="h6" className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Apartment Information
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Apartment Name</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.apartment?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Type</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.apartment?.type || "N/A"}</span>
                      </div>
                      <div className="py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium block mb-1">Address</span>
                        <span className="font-semibold text-gray-800 text-sm">{selectedBooking.apartment?.address || "N/A"}</span>
                      </div>
                      <div className="py-2">
                        <span className="text-gray-600 font-medium block mb-1">Amenities</span>
                        <span className="font-semibold text-gray-800 text-sm">{selectedBooking.apartment?.servicing || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Typography variant="h6" className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Transaction Information
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Reference</span>
                        <span className="font-semibold text-gray-800 font-mono text-sm">{selectedBooking.transaction?.reference || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Amount</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(selectedBooking.amount || selectedBooking.transaction?.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Transaction Status</span>
                        <span className="font-semibold text-gray-800">{selectedBooking.transaction?.status || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Payment Date</span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {selectedBooking.transaction?.date_paid ? formatDate(selectedBooking.transaction.date_paid) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
                
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AdminBooking;