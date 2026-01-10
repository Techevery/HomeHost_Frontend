import React, { useState, useEffect } from "react";
import { Paper, ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import { useLocation } from "react-router-dom";
import useBookingStore from "../../../../stores/bookingStore";

const BookingDetails = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const { bookings, loading, error, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Modified helper function to format dates with specific requirements
  const formatDate = (dateString: string, isCheckout = false) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      // Clone the date to avoid mutating the original
      const adjustedDate = new Date(date);
      
      if (isCheckout) {
        // For checkout: add +1 day and set time to 12 PM (noon)
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        adjustedDate.setHours(12, 0, 0, 0);
      } else {
        // For check-in: set time to 1 PM
        adjustedDate.setHours(13, 0, 0, 0);
      }

      return adjustedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Safe data transformation with validation
  const transformBookingData = () => {
    if (!bookings || !Array.isArray(bookings)) {
      return [];
    }

    return bookings.map((booking) => ({
      id: booking?.id || `temp-${Math.random()}`,
      customer: booking?.guest_name || "Customer",
      apartment_booked: booking?.apartment?.name || "Apartment",
      date: formatDate(booking?.created_at),
      phone_number: booking?.guest_phone || "N/A",
      check_in: formatDate(booking?.booking_start_date, false), // Not checkout
      check_out: formatDate(booking?.booking_end_date, true), // Is checkout
      apartment_agent: "Agent",
      status: mapStatus(booking?.status),
    }));
  };

  const mapStatus = (status: string) => {
    if (!status) return "Unavailable";

    const statusMap: { [key: string]: string } = {
      booked: "Booked",
      unavailable: "Unavailable",
      pending: "Pending",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return statusMap[status] || "Unavailable";
  };

  // Filter data based on selected status with validation
  const filteredData = React.useMemo(() => {
    const transformedData = transformBookingData();

    if (selectedStatus === "all") {
      return transformedData;
    }

    return transformedData.filter(
      (booking) =>
        booking.status.toLowerCase() === selectedStatus.toLowerCase(),
    );
  }, [bookings, selectedStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Booked: { color: "bg-green-100 text-green-800", label: "Booked    " },
      Unavailable: { color: "bg-yellow-100 text-yellow-800", label: "Unavailable" },
      Rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      Cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Unavailable;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const COLUMNS = [
    {
      title: "Customer",
      field: "customer",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="flex items-center">
          <span className="font-medium text-gray-900">
            {rowData.customer || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Apartment Booked",
      field: "apartment_booked",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="font-medium text-gray-700">
          {rowData.apartment_booked || "N/A"}
        </div>
      ),
    },
    {
      title: "Booking Date",
      field: "date",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.date || "N/A"}</div>
      ),
    },
    {
      title: "Phone Number",
      field: "phone_number",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.phone_number || "N/A"}</div>
      ),
    },
    {
      title: "Check In",
      field: "check_in",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.check_in || "N/A"}</div>
      ),
    },
    {
      title: "Check Out",
      field: "check_out",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.check_out || "N/A"}</div>
      ),
    },
    {
      title: "Status",
      field: "status",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => getStatusBadge(rowData.status),
    },
  ];

  const defaultMaterialTheme = createTheme({
    palette: {
      primary: {
        main: "#3B82F6",
      },
    },
    typography: {
      fontFamily: "inherit",
    },
  });

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-red-600">Error: {error}</div>
            <button
              onClick={() => fetchBookings()}
              className="ml-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">Booking Details</h4>

          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>

        <div className="w-full">
          <ThemeProvider theme={defaultMaterialTheme}>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/icon?family=Material+Icons"
            />

            <div className="w-full overflow-auto rounded-lg border border-gray-200">
              <MaterialTable
                components={{
                  Container: (props) => <Paper {...props} elevation={0} />,
                }}
                columns={COLUMNS}
                data={filteredData}
                title=""
                options={{
                  paging: true,
                  search: true,
                  rowStyle: {
                    color: "#374151",
                    backgroundColor: "transparent",
                    fontWeight: 400,
                    fontSize: "14px",
                    padding: "16px 0",
                    borderBottom: "1px solid #F3F4F6",
                  },
                  headerStyle: {
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "14px",
                    backgroundColor: "#F9FAFB",
                    border: 0,
                    borderBottom: "1px solid #E5E7EB",
                    padding: "16px 20px",
                  },
                  searchFieldStyle: {
                    borderRadius: "8px",
                    borderBottom: "none",
                    width: "300px",
                    height: "40px",
                    backgroundColor: "white",
                    marginRight: "16px",
                  },
                  searchFieldVariant: "standard",
                  actionsColumnIndex: -1,
                  actionsCellStyle: {
                    border: "0",
                    paddingLeft: "20px",
                  },
                  exportButton: false,
                  minBodyHeight: "400px",
                  pageSize: 10,
                  pageSizeOptions: [5, 10, 20],
                  paginationType: "stepped",
                  showFirstLastPageButtons: true,
                }}
                localization={{
                  body: {
                    emptyDataSourceMessage: "No bookings found",
                  },
                }}
              />
            </div>
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;