import React, { useEffect, useState } from "react";
import { Paper, Modal, Box, Typography, IconButton, Tabs, Tab } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable from "material-table";
import useBookingStore from "../../../../stores/bookingStore";
import CloseIcon from '@mui/icons-material/Close';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-0">{children}</div>}
    </div>
  );
}

const AdminBooking = () => {
  const { bookings, loading, error, fetchBookings } = useBookingStore();
  
  type BookingType = typeof bookings[0];
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
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
        return "#15ff00ff";
      case "currently hosting":
        return "#4A90E2";
      case "deleted":
        return "#720303ff";
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
        return "Upcoming"; // Changed from "Pending" to "Upcoming"
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

  const getNextOfKin = (booking: any) => {
    const metadata = booking?.transaction?.metadata;
    if (!metadata) return { name: "N/A", number: "N/A" };
    
    return {
      name: metadata.nextofKinName || "N/A",
      number: metadata.nextofKinNumber || "N/A"
    };
  };

  const getBookingDetails = (booking: any) => {
    const metadata = booking?.transaction?.metadata;
    return {
      dailyPrice: metadata?.dailyPrice ? formatCurrency(metadata.dailyPrice) : "N/A",
      originalAmount: metadata?.originalAmount ? formatCurrency(metadata.originalAmount) : "N/A",
      isMarkedUp: metadata?.isMarkedUp || false,
      totalBookingPeriods: metadata?.totalBookingPeriods || 0
    };
  };

  const getApartmentDetails = (booking: any) => {
    const metadata = booking?.transaction?.metadata;
    return {
      note: metadata?.note || `1B = New ${Math.floor(Math.random() * 100)}, (${booking.duration_days || 4} days)`
    };
  };

  // Filter bookings based on tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case 0: // Booking Details - Successful and Deleted
        return bookings.filter(booking => {
          const status = booking.status?.toLowerCase() || "";
          return status.includes("success") || status.includes("complete") || status.includes("delete");
        });
      case 1: // Booking Request - Pending/Upcoming
        return bookings.filter(booking => {
          const status = booking.status?.toLowerCase() || "";
          return status.includes("pending") || status.includes("booked") || status.includes("upcoming");
        });
      default:
        return bookings;
    }
  };

  // Common table data for both tabs with filtering
  const filteredBookings = getFilteredBookings();
  const tableData = filteredBookings.map((booking) => {
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
      transaction_status: booking.transaction?.status || "N/A",
      amount: booking.amount || booking.transaction?.amount || "N/A",
      note: apartmentDetails.note,
    };
  });

  // Updated Columns for Booking Details Tab to match Booking Request style
  const BOOKING_DETAILS_COLUMNS = [
    {
      title: "AGENT & PROPERTY",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex flex-col">
          <div className="font-semibold text-gray-800 text-sm">{rowData.apartment_agent}</div>
           
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
        <div className="font-medium text-gray-800 text-sm">{rowData.customer}</div>
          
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

  // Columns for Booking Request Tab
  const BOOKING_REQUEST_COLUMNS = [
    {
      title: "AGENT & PROPERTY",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex flex-col">
          <div className="font-semibold text-gray-800 text-sm">{rowData.apartment_agent}</div>
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
        <div className="font-medium text-gray-800 text-sm">{rowData.customer}</div>
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
    <div className="bg-[#E5E5E5] min-h-screen p-4 sm:p-6">
      <h4 className="text-[18px] sm:text-[20px] font-bold mb-6">Booking Management</h4>
      
      {/* Tabs */}
      <div className="bg-white rounded-t-[20px] p-4 sm:p-5 mb-0">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab 
            label="Booking Details" 
            className={`text-sm sm:text-base font-medium ${
              activeTab === 0 ? 'text-blue-600' : 'text-gray-500'
            }`}
          />
          <Tab 
            label="Booking Request" 
            className={`text-sm sm:text-base font-medium ${
              activeTab === 1 ? 'text-blue-600' : 'text-gray-500'
            }`}
          />
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="bg-white rounded-b-[20px] p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-4 sm:gap-12">
          <div className="bg-[#4EC368] rounded-[12px] text-white px-4 sm:px-8 py-3 text-sm sm:text-base">
            Successful ({tableData.filter(item => item.status.toLowerCase().includes("success") || item.status.toLowerCase().includes("complete")).length})
          </div>
          <div className="bg-[#D84A4A] rounded-[12px] text-white px-8 sm:px-14 py-3 text-sm sm:text-base">
            Failed ({tableData.filter(item => item.status.toLowerCase().includes("fail") || item.status.toLowerCase().includes("cancel")).length})
          </div>
          <div className="bg-[#6B7280] rounded-[12px] text-white px-8 sm:px-14 py-3 text-sm sm:text-base">
            Deleted ({tableData.filter(item => item.status.toLowerCase().includes("delete")).length})
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
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
                  columns={BOOKING_DETAILS_COLUMNS}
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
                  actions={[
                    {
                      icon: 'filter_list',
                      tooltip: 'Filter',
                      isFreeAction: true,
                      onClick: (event) => {
                        // Add your filter logic here
                        console.log('Filter button clicked');
                        // You can open a filter dialog or dropdown here
                      }
                    }
                  ]}
                />
              </div>
            </ThemeProvider>
          </div>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
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
                  columns={BOOKING_REQUEST_COLUMNS}
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
                  actions={[
                    {
                      icon: 'filter_list',
                      tooltip: 'Filter',
                      isFreeAction: true,
                      onClick: (event) => {
                        // Add your filter logic here
                        console.log('Filter button clicked');
                        // You can open a filter dialog or dropdown here
                      }
                    }
                  ]}
                />
              </div>
            </ThemeProvider>
          </div>
        </div>
      </TabPanel>

 {/* Booking Details Modal - Exact match to View Booking image */}
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
      width: '95%',
      maxWidth: '600px',
      maxHeight: '95vh',
      bgcolor: 'background.paper',
      borderRadius: '8px',
      boxShadow: 24,
      p: 0,
      overflow: 'hidden',
    }}
    className="bg-white" // Added bg-white class here
  >
    {/* Modal Header */}
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <Typography variant="h5" className="font-bold text-black text-xl"> {/* Changed to text-black */}
          Booking Details
        </Typography>
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            className="px-4 py-2 bg-[#4EC368] text-white rounded-lg font-medium hover:bg-[#3DAF55] transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    </div>

    {selectedBooking && (
      <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(95vh-80px)] bg-white">
        
        {/* Customer Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg"> {/* Changed to text-black */}
            Customer Information
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Guest Name
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {getCustomerName(selectedBooking)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Phone Number
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {getPhoneNumber(selectedBooking)}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Email
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.transaction?.email || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Next of Kin Name
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {getNextOfKin(selectedBooking).name}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg"> {/* Changed to text-black */}
            Booking Information
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Booking Date
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {formatDate(selectedBooking.created_at || "")}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Check in
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {formatDate(selectedBooking.booking_start_date || selectedBooking.booking_period?.start_date || "")}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Duration
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.duration_days || selectedBooking.booking_period?.duration_days || 0} days
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Check out
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {formatDate(selectedBooking.booking_end_date || selectedBooking.booking_period?.end_date || "")}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Apartment Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg"> {/* Changed to text-black */}
            Apartment Information
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Apartment Name
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.apartment?.name || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Type
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.apartment?.type || "N/A"}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Address
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.apartment?.address || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Amenities
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.apartment?.servicing || "N/A"}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg"> {/* Changed to text-black */}
            Pricing Information
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Ref
                </Typography>
                <Typography variant="body1" className="font-semibold text-black font-mono"> {/* Changed to text-black */}
                  {selectedBooking.transaction?.reference || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Daily price
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {getBookingDetails(selectedBooking).dailyPrice}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Total Amount
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {formatCurrency(selectedBooking.amount || selectedBooking.transaction?.amount)}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Price Markup
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {getBookingDetails(selectedBooking).isMarkedUp ? "Yes" : "None"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Transaction status
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.status || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700"> {/* Changed to gray-700 */}
                  Payment Date
                </Typography>
                <Typography variant="body1" className="font-semibold text-black"> {/* Changed to text-black */}
                  {selectedBooking.booking_start_date ? formatDate(selectedBooking.booking_start_date || selectedBooking.booking_period?.start_date || "") : "N/A"}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex justify-center pt-6 border-t border-gray-200">
          <button
            className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
          >
            Delete
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