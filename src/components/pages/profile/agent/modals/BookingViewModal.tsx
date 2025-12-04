import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Paper,
  Modal,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  Snackbar
} from "@material-ui/core";
import {
  Alert,
  ThemeProvider,
  createTheme
} from "@mui/material";
import MaterialTable, { Column } from "material-table";
import useBookingStore from "../../../../../stores/bookingStore";
import CloseIcon from '@mui/icons-material/Close';
import { MdFilterList, MdSearch, MdClose } from 'react-icons/md';

interface BookingViewModalProps {
  open: boolean;
  onClose: () => void;
}

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

enum BookingStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
  UPCOMING = 'UPCOMING',
  PENDING = 'PENDING'
}

interface TableRowData {
  id: string;
  customer: string;
  apartment_booked: string;
  date: string;
  phone_number: string;
  check_in: string;
  check_out: string;
  apartment_agent: string;
  status: string;
  displayStatus: string;
  transaction_status: string;
  amount: string | number;
  note: string;
  originalBooking: any;
  isDeleted: boolean;
  isEditable: boolean;
}

const BookingViewModal: React.FC<BookingViewModalProps> = ({ open, onClose }) => {
  const {
    bookings,
    loading,
    error,
    fetchBookings
  } = useBookingStore();
  
  type BookingType = typeof bookings[0];
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [filteredData, setFilteredData] = useState<TableRowData[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (open) {
      fetchBookings();
    }
  }, [open, fetchBookings]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: any) => {
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(numAmount || 0);
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
        return "Upcoming";
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

  const getApartmentAgent = (booking: any) => {
    if (booking.apartment?.agent) {
      return booking.apartment.agent;
    }
    if (booking.transaction?.agent?.name) {
      return booking.transaction.agent.name;
    }
    if (typeof booking.apartment === 'string') {
      return booking.apartment;
    }
    return "N/A";
  };

  const getFilteredCounts = useMemo(() => {
    const counts = {
      successful: 0,
      failed: 0,
      deleted: 0,
      upcoming: 0,
      pending: 0,
    };

    if (!bookings.length) return counts;

    bookings.forEach(booking => {
      const status = booking.status?.toLowerCase() || "";
      const isDeleted = (booking.booking_period as any)?.isDeleted || false;
      
      if (isDeleted) {
        counts.deleted++;
      } else if (status.includes("success") || status.includes("complete")) {
        counts.successful++;
      } else if (status.includes("fail") || status.includes("cancel")) {
        counts.failed++;
      } else if (status.includes("upcoming") || status.includes("booked") || status.includes("pending")) {
        counts.upcoming++;
      } else if (status.includes("pending")) {
        counts.pending++;
      }
    });

    return counts;
  }, [bookings]);

  // Create table data from bookings with memoization
  const createTableData = useCallback(() => {
    if (!bookings.length) return [];

    const getFilteredBookings = () => {
      switch (activeTab) {
        case 0:
          return bookings.filter(booking => {
            const status = booking.status?.toLowerCase() || "";
            const isDeleted = (booking.booking_period as any)?.isDeleted || false;
            
            return status.includes("success") || 
                   status.includes("complete") || 
                   status.includes("fail") || 
                   status.includes("cancel") ||
                   isDeleted ||
                   status.includes("delete");
          });
        case 1:
          return bookings.filter(booking => {
            const status = booking.status?.toLowerCase() || "";
            const isDeleted = (booking.booking_period as any)?.isDeleted || false;
            
            return (status.includes("pending") || 
                    status.includes("booked") || 
                    status.includes("upcoming")) &&
                   !isDeleted;
          });
        default:
          return bookings;
      }
    };

    const filteredBookings = getFilteredBookings();

    return filteredBookings.map((booking): TableRowData => {
      const status = booking.status || "Unknown";
      const isDeleted = (booking.booking_period as any)?.isDeleted || false;
      const apartmentName = typeof booking.apartment === 'object' ? booking.apartment?.name : booking.apartment || "N/A";
      const bookingDetails = getApartmentDetails(booking);
      
      return {
        id: booking.id,
        customer: getCustomerName(booking),
        apartment_booked: apartmentName,
        date: formatDate(booking.created_at || ""),
        phone_number: getPhoneNumber(booking),
        check_in: formatDate(booking.booking_start_date || (booking.booking_period as any)?.start_date || ""),
        check_out: formatDate(booking.booking_end_date || (booking.booking_period as any)?.end_date || ""),
        apartment_agent: getApartmentAgent(booking),
        status: isDeleted ? "deleted" : status,
        displayStatus: isDeleted ? "Deleted" : getStatusText(status),
        transaction_status: booking.transaction?.status || "N/A",
        amount: booking.amount || booking.transaction?.amount || "N/A",
        note: bookingDetails.note,
        originalBooking: booking,
        isDeleted: isDeleted,
        isEditable: false,
      };
    });
  }, [bookings, activeTab]);

  // Cache the search results using useMemo
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return null;
    
    const searchLower = searchText.toLowerCase().trim();
    
    const searchableFields = createTableData().map(row => ({
      id: row.id,
      searchText: [
        row.customer,
        row.apartment_booked,
        row.apartment_agent,
        row.phone_number,
        row.status,
        row.displayStatus,
        row.id
      ].join(' ').toLowerCase()
    }));
    
    const matchedIds = searchableFields
      .filter(field => field.searchText.includes(searchLower))
      .map(field => field.id);
    
    return new Set(matchedIds);
  }, [searchText, createTableData]);

  // Update filtered data based on status filter and search
  const updateFilteredData = useCallback(() => {
    let tableData = createTableData();
    
    if (statusFilter !== 'ALL') {
      tableData = tableData.filter(row => {
        const status = row.status.toLowerCase();
        const displayStatus = row.displayStatus.toLowerCase();
        
        switch (statusFilter) {
          case BookingStatus.SUCCESSFUL:
            return status.includes("success") || status.includes("complete");
          case BookingStatus.FAILED:
            return status.includes("fail") || status.includes("cancel");
          case BookingStatus.DELETED:
            return status.includes("delete") || row.isDeleted;
          case BookingStatus.UPCOMING:
            return status.includes("upcoming") || status.includes("pending") || status.includes("booked");
          case BookingStatus.PENDING:
            return status.includes("pending");
          default:
            return true;
        }
      });
    }

    if (searchResults && searchText.trim()) {
      tableData = tableData.filter(row => searchResults.has(row.id));
    }

    setFilteredData(tableData);
  }, [createTableData, statusFilter, searchText, searchResults]);

  useEffect(() => {
    updateFilteredData();
  }, [updateFilteredData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const handleRowClick = (event: any, rowData: any) => {
    const originalBooking = bookings.find(booking => booking.id === rowData.id);
    setSelectedBooking(originalBooking || null);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
    setStatusFilter('ALL');
    setSearchText('');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const bookingDetailsStatusFilterOptions = [
    { value: 'ALL' as const, label: 'All Status', count: filteredData.length },
    { 
      value: BookingStatus.SUCCESSFUL, 
      label: 'Successful', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("success") || 
        row.status.toLowerCase().includes("complete") ||
        row.displayStatus.toLowerCase().includes("success")
      ).length 
    },
    { 
      value: BookingStatus.DELETED, 
      label: 'Deleted', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("delete") ||
        row.displayStatus.toLowerCase().includes("delete") ||
        row.isDeleted
      ).length 
    },
  ];

  const bookingRequestStatusFilterOptions = [
    { value: 'ALL' as const, label: 'All Status', count: filteredData.length },
    { 
      value: BookingStatus.UPCOMING, 
      label: 'Upcoming', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("upcoming") || 
        row.status.toLowerCase().includes("pending") || 
        row.status.toLowerCase().includes("booked") ||
        row.displayStatus.toLowerCase().includes("upcoming")
      ).length 
    }
  ];

  const getCurrentStatusFilterOptions = () => {
    return activeTab === 0 ? bookingDetailsStatusFilterOptions : bookingRequestStatusFilterOptions;
  };

  const BOOKING_DETAILS_COLUMNS: Column<TableRowData>[] = [
    {
      title: "AGENT & PROPERTY",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: TableRowData) => (
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
      render: (rowData: TableRowData) => (
        <div className="font-medium text-gray-800 text-sm">{rowData.customer}</div>
      ),
    },
    {
      title: "PHONE NO",
      field: "phone_number",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.phone_number}</div>,
    },
    {
      title: "BOOKING DATE",
      field: "date",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.date}</div>,
    },
    {
      title: "CHECK IN",
      field: "check_in",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.check_in}</div>,
    },
    {
      title: "CHECK OUT",
      field: "check_out",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.check_out}</div>,
    },
    {
      title: "AMOUNT",
      field: "amount",
      cellStyle: {},
      render: (rowData: TableRowData) => (
        <div className="text-gray-700 text-sm font-medium">
          {formatCurrency(rowData.amount)}
        </div>
      ),
    },
    {
      title: "STATUS",
      field: "status",
      cellStyle: {},
      render: (rowData: TableRowData) => (
        <div className="font-medium text-sm" style={{ color: getStatusColor(rowData.status) }}>
          {rowData.displayStatus}
        </div>
      ),
    }
  ];

  const BOOKING_REQUEST_COLUMNS: Column<TableRowData>[] = [
    {
      title: "AGENT & PROPERTY",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: TableRowData) => (
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
      render: (rowData: TableRowData) => (
        <div className="font-medium text-gray-800 text-sm">{rowData.customer}</div>
      ),
    },
    {
      title: "PHONE NO",
      field: "phone_number",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.phone_number}</div>,
    },
    {
      title: "BOOKING DATE",
      field: "date",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.date}</div>,
    },
    {
      title: "CHECK IN",
      field: "check_in",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.check_in}</div>,
    },
    {
      title: "CHECK OUT",
      field: "check_out",
      cellStyle: {},
      render: (rowData: TableRowData) => <div className="text-gray-700 text-sm">{rowData.check_out}</div>,
    },
    {
      title: "AMOUNT",
      field: "amount",
      cellStyle: {},
      render: (rowData: TableRowData) => (
        <div className="text-gray-700 text-sm font-medium">
          {formatCurrency(rowData.amount)}
        </div>
      ),
    },
    {
      title: "STATUS",
      field: "status",
      cellStyle: {},
      render: (rowData: TableRowData) => (
        <div className="font-medium text-sm" style={{ color: getStatusColor(rowData.status) }}>
          {rowData.displayStatus}
        </div>
      ),
    }
  ];

  const defaultMaterialTheme = createTheme({
    palette: {},
  });

  if (loading && open) {
    return (
      <Modal
        open={open}
        onClose={onClose}
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
            maxWidth: '1200px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-xl">
                Booking Management
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-lg">Loading bookings...</p>
            </div>
          </div>
        </Box>
      </Modal>
    );
  }

  if (error && open) {
    return (
      <Modal
        open={open}
        onClose={onClose}
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
            maxWidth: '1200px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-xl">
                Booking Management
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
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
        </Box>
      </Modal>
    );
  }

  if (!open) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
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
            maxWidth: '1200px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-xl">
                Booking Management
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div className="flex flex-col h-[calc(95vh-80px)] overflow-hidden">
            {/* Header Tabs Section */}
            <div className="flex-shrink-0 p-6 pb-0">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                className="justify-start"
              >
                <Tab 
                  label={
                    <span className="font-bold text-base">
                      Booking Details
                    </span>
                  }
                  className={`min-w-0 mr-6 ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}
                />
                <Tab 
                  label={
                    <span className="font-bold text-base">
                      Booking Request
                    </span>
                  }
                  className={`min-w-0 ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}
                />
              </Tabs>
              
              <div className="bg-white rounded-t-[20px] p-4 sm:p-5 mt-4">
                <div className="flex flex-wrap gap-4 sm:gap-12">
                  <div className="bg-[#4EC368] rounded-[12px] text-white px-4 sm:px-8 py-3 text-sm sm:text-base">
                    {activeTab === 0 ? 'Successful' : 'Upcoming'} ({activeTab === 0 ? getFilteredCounts.successful : getFilteredCounts.upcoming})
                  </div>
                  {activeTab === 0 ? (
                    <div className="bg-[#6B7280] rounded-[12px] text-white px-8 sm:px-14 py-3 text-sm sm:text-base">
                      Deleted ({getFilteredCounts.deleted})
                    </div>
                  ) : (
                    <div className="bg-[#4EC368] rounded-[12px] text-white px-8 sm:px-14 py-3 text-sm sm:text-base">
                      Pending ({getFilteredCounts.pending})
                    </div>
                  )}
                </div>
              </div>

              {showStatusFilter && (
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 mt-4">
                  <div className="flex items-center gap-2">
                    <MdFilterList className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentStatusFilterOptions().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          statusFilter === option.value
                            ? option.value === 'ALL' 
                              ? 'bg-blue-600 text-white'
                              : option.value === BookingStatus.SUCCESSFUL
                              ? 'bg-green-600 text-white'
                              : option.value === BookingStatus.DELETED
                              ? 'bg-gray-600 text-white'
                              : 'bg-yellow-600 text-white'
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
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-auto p-6 pt-4">
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
                            Toolbar: (props) => (
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between p-4">
                                  <div className="relative flex-1 max-w-md">
                                    <div className="relative">
                                      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                      <input
                                        type="text"
                                        placeholder="Search bookings..."
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
                              </div>
                            ),
                          }}
                          columns={BOOKING_DETAILS_COLUMNS}
                          data={filteredData}
                          title=""
                          onRowClick={handleRowClick}
                          options={{
                            paging: true,
                            search: false,
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
                            actionsColumnIndex: -1,
                            actionsCellStyle: {
                              border: "0",
                              paddingLeft: "2%",
                            },
                            exportButton: true,
                            minBodyHeight: "300px",
                            maxBodyHeight: "500px",
                          }}
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
                            Toolbar: (props) => (
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between p-4">
                                  <div className="relative flex-1 max-w-md">
                                    <div className="relative">
                                      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                      <input
                                        type="text"
                                        placeholder="Search booking requests..."
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
                              </div>
                            ),
                          }}
                          columns={BOOKING_REQUEST_COLUMNS}
                          data={filteredData}
                          title=""
                          onRowClick={handleRowClick}
                          options={{
                            paging: true,
                            search: false,
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
                            actionsColumnIndex: -1,
                            actionsCellStyle: {
                              border: "0",
                              paddingLeft: "2%",
                            },
                            exportButton: true,
                            minBodyHeight: "300px",
                            maxBodyHeight: "500px",
                          }}
                        />
                      </div>
                    </ThemeProvider>
                  </div>
                </div>
              </TabPanel>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
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
            maxWidth: '800px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-xl">
                Booking Details
              </Typography>
              <IconButton onClick={handleCloseDetailModal} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          {selectedBooking && (
            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(95vh-80px)] bg-white">
              
              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold text-black text-lg">
                  Customer Information
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Guest Name
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {getCustomerName(selectedBooking)}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Phone Number
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {getPhoneNumber(selectedBooking)}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Email
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {selectedBooking.transaction?.email || "N/A"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Next of Kin Name
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {getNextOfKin(selectedBooking).name}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold text-black text-lg">
                  Booking Information
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Booking Date
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {formatDate(selectedBooking.created_at || "")}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Check in
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {formatDate(selectedBooking.booking_start_date || (selectedBooking.booking_period as any)?.start_date || "")}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Duration
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {selectedBooking.duration_days || (selectedBooking.booking_period as any)?.duration_days || 0} days
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Check out
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {formatDate(selectedBooking.booking_end_date || (selectedBooking.booking_period as any)?.end_date || "")}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold text-black text-lg">
                  Apartment Information
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Apartment Name
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {typeof selectedBooking.apartment === 'object' ? selectedBooking.apartment?.name : selectedBooking.apartment || "N/A"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Type
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {typeof selectedBooking.apartment === 'object' ? selectedBooking.apartment?.type : "N/A"}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Address
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {typeof selectedBooking.apartment === 'object' ? selectedBooking.apartment?.address : "N/A"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Amenities
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {typeof selectedBooking.apartment === 'object' ? selectedBooking.apartment?.servicing : "N/A"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold text-black text-lg">
                  Pricing Information
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Ref
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black font-mono">
                        {selectedBooking.transaction?.reference || "N/A"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Daily price
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {getBookingDetails(selectedBooking).dailyPrice}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Total Amount
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {formatCurrency(selectedBooking.amount || selectedBooking.transaction?.amount)}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Price Markup
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {getBookingDetails(selectedBooking).isMarkedUp ? "Yes" : "None"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Transaction status
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {selectedBooking.status || "N/A"}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" className="text-sm font-medium mb-1 text-gray-700">
                        Payment Date
                      </Typography>
                      <Typography variant="body1" className="font-semibold text-black">
                        {selectedBooking.booking_start_date ? formatDate(selectedBooking.booking_start_date || (selectedBooking.booking_period as any)?.start_date || "") : "N/A"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          className="shadow-lg"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BookingViewModal;