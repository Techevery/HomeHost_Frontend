import React, { useEffect } from "react";
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { Link, useLocation } from "react-router-dom";
import useBookingStore from "../../../../stores/bookingStore";

const AdminBooking = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const { bookings, loading, error, fetchBookings } = useBookingStore();

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

  const tableData = bookings.map((booking) => ({
    id: booking.id,
    customer: booking.guest_name || "N/A",
    apartment_booked: booking.apartment?.name || "N/A",
    date: formatDate(booking.created_at),
    phone_number: booking.guest_phone || booking.phone_number || "N/A",
    check_in: formatDate(booking.booking_start_date),
    check_out: formatDate(booking.booking_end_date),
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
        <div className="text-[#1ED75A]">
          {rowData.status === "Successful" ||
          rowData.status === "successful" ? (
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
    <div className="bg-[#E5E5E5] h-screen">
      <h4 className="text-[20px] font-bold">Booking Details</h4>
      <div className="bg-white mt-5 rounded-[20px] p-5">
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

      <div className="flex w-full items-center pt-[40px] justify-center">
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
    </div>
  );
};

export default AdminBooking;
