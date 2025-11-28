
import React, { useEffect, useState } from "react";
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import { useNavigate } from "react-router-dom";
import useBookingStore from "../../../../stores/bookingStore";

const BookingRequest = () => {
  const navigate = useNavigate();
  const { bookings, loading, error, fetchBookings } = useBookingStore();
  
  type BookingType = typeof bookings[0];
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);

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
      case "upcoming":
        return "#FFA500";
      case "currently hosting":
        return "#4A90E2";
      case "deleted":
        return "#6B7280";
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
      case "upcoming":
        return "Upcoming";
      case "currently hosting":
        return "Currently Hosting";
      case "deleted":
        return "Deleted";
      default:
        return status || "Unknown";
    }
  };

  const getCustomerName = (booking: any) => {
    return booking?.transaction?.metadata?.fullName || booking.guest_name || "N/A";
  };

  const getPhoneNumber = (booking: any) => {
    return booking?.transaction?.phone_number || booking.guest_phone || booking.phone_number || "N/A";
  };

  const getApartmentDetails = (booking: any) => {
    const metadata = booking?.transaction?.metadata;
    return {
      note: metadata?.note || `1B = New ${Math.floor(Math.random() * 100)}, (${booking.duration_days || 4} days)`
    };
  };

  const tableData = bookings.map((booking) => {
    const apartmentDetails = getApartmentDetails(booking);
    return {
      id: booking.id,
      customer: getCustomerName(booking),
      apartment_booked: booking.apartment?.name || "N/A",
      date: formatDate(booking.created_at || ""),
      phone_number: getPhoneNumber(booking),
      check_in: formatDate(booking.booking_start_date || booking.booking_period?.start_date || ""),
      check_out: formatDate(booking.booking_end_date || booking.booking_period?.end_date || ""),
      apartment_agent: booking.apartment?.agent || booking.transaction?.agent?.name || "N/A",
      status: booking.status || "Unknown",
      note: apartmentDetails.note,
    };
  });

  const COLUMNS = [
    {
      title: "AGENT & PROPERTY",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex flex-col">
          <div className="font-semibold text-gray-800 text-sm">{rowData.customer}</div>
          <div className="text-xs text-gray-600 mt-1">{rowData.apartment_booked}</div>
          <div className="text-xs text-gray-500 mt-1">Booking: {rowData.id}</div>
          <div className="text-xs text-gray-400 mt-1">({rowData.note})</div>
        </div>
      ),
    },
    {
      title: "CUSTOMER NAME",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="font-medium text-gray-800 text-sm">{rowData.apartment_agent}</div>
      ),
    },
    {
      title: "PHONE NO",
      field: "phone_number",
      cellStyle: {},
      render: (rowData: any) => <div className="text-gray-700 text-sm">{rowData.phone_number}</div>,
    },
    {
      title: "BOOKING DATE",
      field: "date",
      cellStyle: {},
      render: (rowData: any) => <div className="text-gray-700 text-sm">{rowData.date}</div>,
    },
    {
      title: "CHECK IN",
      field: "check_in",
      cellStyle: {},
      render: (rowData: any) => <div className="text-gray-700 text-sm">{rowData.check_in}</div>,
    },
    {
      title: "CHECK OUT",
      field: "check_out",
      cellStyle: {},
      render: (rowData: any) => <div className="text-gray-700 text-sm">{rowData.check_out}</div>,
    },
    {
      title: "STATUS",
      field: "status",
      cellStyle: {},
      render: (rowData: any) => (
        <div className="font-medium text-sm" style={{ color: getStatusColor(rowData.status) }}>
          {getStatusText(rowData.status)}
        </div>
      ),
    },
  ];

  const defaultMaterialTheme = createTheme({
    palette: {},
  });

  const handleRowClick = (event: any, rowData: any) => {
    const originalBooking = bookings.find(booking => booking.id === rowData.id);
    setSelectedBooking(originalBooking || null);
    // Navigate to booking details or open modal
    navigate(`/admin/bookings/${rowData.id}`);
  };

  if (loading) {
    return (
      <div className="bg-[#E5E5E5] h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading booking requests...</p>
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
    <div className="bg-[#E5E5E5] min-h-screen p-4 sm:p-6">
      <h4 className="text-[18px] sm:text-[20px] font-bold mb-6">Booking Request</h4>
      
      {/* Stats Cards */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-4 sm:gap-12">
          <div className="bg-[#4EC368] rounded-[12px] text-white px-4 sm:px-8 py-3 text-sm sm:text-base">
            Successful ({tableData.filter(item => item.status.toLowerCase().includes("success") || item.status.toLowerCase().includes("complete")).length})
          </div>
          <div className="bg-[#D84A4A] rounded-[12px] text-white px-8 sm:px-14 py-3 text-sm sm:text-base">
            Failed ({tableData.filter(item => item.status.toLowerCase().includes("fail") || item.status.toLowerCase().includes("cancel")).length})
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

            <div className="w-full overflow-auto">
              <MaterialTable
                components={{
                  Container: (props) => <Paper {...props} elevation={0} />,
                }}
                columns={COLUMNS}
                data={tableData}
                title=""
                onRowClick={handleRowClick}
                options={{
                  paging: true,
                  search: true,
                  rowStyle: {
                    color: "#474E70",
                    backgroundColor: "transparent",
                    fontWeight: 400,
                    fontSize: "14px",
                    padding: "16px 5px",
                    cursor: "pointer",
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
                    width: "100%",
                    maxWidth: "192px",
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
    </div>
  );
};

export default BookingRequest;