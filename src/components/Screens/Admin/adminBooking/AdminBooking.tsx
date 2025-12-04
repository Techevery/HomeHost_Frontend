import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { 
  Paper, 
  Modal, 
  Box, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Snackbar 
} from "@material-ui/core";
import { 
  Alert,
  ThemeProvider, 
  createTheme 
} from "@mui/material";
import MaterialTable, { Column } from "material-table";
import useBookingStore from "../../../../stores/bookingStore";
import CloseIcon from '@mui/icons-material/Close';
import { MdFilterList, MdSearch, MdClose, MdEdit, MdDelete } from 'react-icons/md';

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
  CURRENTLYHOSTING = 'ONGOING',
}

interface EditBookingForm {
  startDate: string;
  endDate: string;
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

const AdminBooking = () => {
  const { 
    bookings, 
    bookingRequests,
    expiredBookings,
    loading, 
    error, 
    editBookingDates, 
    deleteBooking, 
    fetchBookings,
    fetchBookingRequests,
    fetchExpiredBookings,
    fetchBookingDates,
    bookingDates 
  } = useBookingStore();
  
  type BookingType = typeof bookings[0];
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [filteredData, setFilteredData] = useState<TableRowData[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditBookingForm>({
    startDate: '',
    endDate: ''
  });
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Use ref for search input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      console.log("🔄 Fetching data for tab:", activeTab);
      if (activeTab === 0) {
        console.log("📊 Before fetching expired bookings:", expiredBookings.length);
        await fetchExpiredBookings();
        console.log("📊 After fetching expired bookings:", expiredBookings.length);
      } else if (activeTab === 1) {
        console.log("📊 Before fetching booking requests:", bookingRequests.length);
        await fetchBookingRequests();
        console.log("📊 After fetching booking requests:", bookingRequests.length);
      }
    };
    
    fetchData();
  }, [activeTab, fetchExpiredBookings, fetchBookingRequests]);

  // Focus search input when filter is shown or tab changes
  useEffect(() => {
    if (showStatusFilter && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showStatusFilter]);

  // Focus search input when tab changes
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeTab]);

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

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
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

  const handleRowClick = (event: any, rowData: any) => {
    let originalBooking = null;
    
    if (activeTab === 0) {
      originalBooking = expiredBookings.find(booking => booking.id === rowData.id);
    } else if (activeTab === 1) {
      originalBooking = bookingRequests.find(booking => booking.id === rowData.id);
    }
    
    setSelectedBooking(originalBooking || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
    setStatusFilter('ALL');
    setSearchText('');
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
      case "ongoing":
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
      case "ongoing":
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
      CurrentlyHosting: 0,
    };

    let sourceData: BookingType[] = [];
    if (activeTab === 0) {
      sourceData = expiredBookings;
    } else if (activeTab === 1) {
      sourceData = bookingRequests;
    }

    if (!sourceData.length) return counts;

    sourceData.forEach(booking => {
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
      } else if (status.includes("ongoing")) {
        counts.CurrentlyHosting++;
      }
    });

    return counts;
  }, [expiredBookings, bookingRequests, activeTab]);

  // Create table data from appropriate source
  const createTableData = useCallback(() => {
    let sourceData: BookingType[] = [];
    if (activeTab === 0) {
      sourceData = expiredBookings;
    } else if (activeTab === 1) {
      sourceData = bookingRequests;
    }

    if (!sourceData.length) return [];

    const getFilteredBookings = () => {
      switch (activeTab) {
        case 0:
          return sourceData.filter(booking => {
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
          return sourceData.filter(booking => {
            const status = booking.status?.toLowerCase() || "";
            const isDeleted = (booking.booking_period as any)?.isDeleted || false;
            
            return (status.includes("pending") || 
                    status.includes("booked") || 
                    status.includes("upcoming")) &&
                   !isDeleted;
          });
        default:
          return sourceData;
      }
    };

    const filteredBookings = getFilteredBookings();

    return filteredBookings.map((booking): TableRowData => {
      const status = booking.status || "Unknown";
      const isDeleted = (booking.booking_period as any)?.isDeleted || false;
      const apartmentName = typeof booking.apartment === 'object' ? booking.apartment?.name : booking.apartment || "N/A";
      
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
        note: `1B = New ${Math.floor(Math.random() * 100)}, (${booking.duration_days || 4} days)`,
        originalBooking: booking,
        isDeleted: isDeleted,
        isEditable: !isDeleted && (activeTab === 1 || status.toLowerCase().includes("pending") || status.toLowerCase().includes("upcoming") || status.toLowerCase().includes("booked")),
      };
    });
  }, [expiredBookings, bookingRequests, activeTab]);

  // Enhanced search function that searches all relevant fields
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return null;
    
    const searchLower = searchText.toLowerCase().trim();
    const tableData = createTableData();
    
    // Create search index with all searchable fields
    const searchableFields = tableData.map(row => {
      // Create a comprehensive search string from all searchable fields
      const searchString = [
        row.customer,
        row.apartment_booked,
        row.apartment_agent,
        row.phone_number,
        row.status,
        row.displayStatus,
        row.id,
        row.check_in,
        row.check_out,
        row.date,
        row.note,
        // Also search in the original booking data if available
        row.originalBooking?.transaction?.reference || '',
        row.originalBooking?.transaction?.email || '',
        row.originalBooking?.guest_name || '',
        row.originalBooking?.guest_phone || '',
        // Search in apartment details
        typeof row.originalBooking?.apartment === 'object' ? row.originalBooking?.apartment?.address || '' : '',
        typeof row.originalBooking?.apartment === 'object' ? row.originalBooking?.apartment?.type || '' : '',
        // Search in metadata
        row.originalBooking?.transaction?.metadata?.fullName || '',
        row.originalBooking?.transaction?.metadata?.nextofKinName || '',
        row.originalBooking?.transaction?.metadata?.nextofKinNumber || ''
      ]
        .filter(Boolean) // Remove empty strings
        .join(' ') // Join with space
        .toLowerCase();
      
      return {
        id: row.id,
        searchText: searchString
      };
    });
    
    // Filter rows that match the search
    const matchedIds = searchableFields
      .filter(field => field.searchText.includes(searchLower))
      .map(field => field.id);
    
    // Return a Set for O(1) lookup
    return new Set(matchedIds);
  }, [searchText, createTableData]);

  // Update filtered data based on status filter and search
  const updateFilteredData = useCallback(() => {
    let tableData = createTableData();
    
    // Apply status filter
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
          case BookingStatus.CURRENTLYHOSTING:
            return status.includes("ongoing");
          default:
            return true;
        }
      });
    }

    // Apply search filter using cached results
    if (searchResults && searchText.trim()) {
      tableData = tableData.filter(row => searchResults.has(row.id));
    }

    setFilteredData(tableData);
  }, [createTableData, statusFilter, searchText, searchResults]);

  // Update filtered data when dependencies change
  useEffect(() => {
    updateFilteredData();
  }, [updateFilteredData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleEditClick = () => {
    if (selectedBooking) {
      const startDate = selectedBooking.booking_start_date || (selectedBooking.booking_period as any)?.start_date || '';
      const endDate = selectedBooking.booking_end_date || (selectedBooking.booking_period as any)?.end_date || '';
      
      setEditFormData({
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate)
      });
      setEditModalOpen(true);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedBooking) return;

    try {
      if (!editFormData.startDate || !editFormData.endDate) {
        throw new Error("Please select both start and end dates");
      }

      const newStartDate = new Date(editFormData.startDate);
      const newEndDate = new Date(editFormData.endDate);
      
      newStartDate.setHours(12, 0, 0, 0);
      newEndDate.setHours(12, 0, 0, 0);

      if (newStartDate >= newEndDate) {
        throw new Error("End date must be after start date");
      }
      
      if (selectedBooking.apartment_id) {
        await fetchBookingDates(selectedBooking.apartment_id);
        
        const conflictingBooking = bookingDates.find(date => {
          if (!date.booking_start_date || !date.booking_end_date) return false;
          
          const existingStart = new Date(date.booking_start_date);
          const existingEnd = new Date(date.booking_end_date);
          
          return (
            date.id !== selectedBooking.id &&
            ((newStartDate >= existingStart && newStartDate <= existingEnd) ||
              (newEndDate >= existingStart && newEndDate <= existingEnd) ||
              (newStartDate <= existingStart && newEndDate >= existingEnd))
          );
        });
        
        if (conflictingBooking) {
          throw new Error("Selected dates conflict with an existing booking");
        }
      }
      
      await editBookingDates(selectedBooking.id, newStartDate, newEndDate);
      
      setEditModalOpen(false);
      setSnackbarMessage('Booking dates updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      if (activeTab === 0) {
        await fetchExpiredBookings();
      } else if (activeTab === 1) {
        await fetchBookingRequests();
      }

      setModalOpen(false);
    } catch (error: any) {
      let errorMessage = 'Failed to update booking';
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedBooking) {
      setBookingToDelete(selectedBooking.id);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    try {
      await deleteBooking(bookingToDelete);
      
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
      setSnackbarMessage('Booking deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      if (activeTab === 0) {
        await fetchExpiredBookings();
      } else if (activeTab === 1) {
        await fetchBookingRequests();
      }
      
      setModalOpen(false);
    } catch (error: any) {
      let errorMessage = 'Failed to delete booking';
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
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
    },
    { 
      value: BookingStatus.CURRENTLYHOSTING, 
      label: 'Currently Hosting', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("ongoing") ||
        row.displayStatus.toLowerCase().includes("currently hosting")
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
            onClick={async () => {
              if (activeTab === 0) {
                await fetchExpiredBookings();
              } else if (activeTab === 1) {
                await fetchBookingRequests();
              }
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E5E5E5] min-h-screen p-4 sm:p-6">
       <div className="p-4 sm:p-5 mb-6">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        className="justify-start"
      >
        <Tab 
        label={
          <span className="font-extrabold text-xl sm:text-xl">
          Booking details
          </span>
        }
        style={{ textTransform: 'none' }}
        className={`min-w-0 mr-6 ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}
        />
        <Tab 
        label={
          <span className="font-extrabold text-xl sm:text-xl">
          Booking request
          </span>
        }
        style={{ textTransform: 'none' }}
        className={`min-w-0 ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}
        />
      </Tabs>

      {/* full-width visible horizontal line */}
      <div className="w-full border-b-2 border-gray-300 mt-0" />
      </div>
      
      <div className="bg-white rounded-t-[20px] p-4 sm:p-5 mb-0">
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
              Currently Hosting ({getFilteredCounts.CurrentlyHosting})
            </div>
          )}
        </div>
      </div>

      {showStatusFilter && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50">
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

      <TabPanel value={activeTab} index={0}>
        <div className="flex w-full items-center justify-center mt-4">
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
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by customer, agent, property, phone, status, ID..."
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
                            {/* Removed the dropdown */}
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
                    minBodyHeight: "400px",
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
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by customer, agent, property, phone, status, ID..."
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
                            {/* Removed the dropdown */}
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
                    minBodyHeight: "400px",
                  }}
                />
              </div>
            </ThemeProvider>
          </div>
        </div>
      </TabPanel>

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
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-xl">
                Booking Details
              </Typography>
              <div className="flex items-center gap-2">
                {selectedBooking && !(selectedBooking.booking_period as any)?.isDeleted && activeTab === 1 && (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-[#4EC368] text-white rounded-lg font-medium hover:bg-[#3DAF55] transition-colors duration-200 flex items-center gap-2"
                  >
                    <MdEdit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
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

              {activeTab === 1 && !(selectedBooking.booking_period as any)?.isDeleted && (
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    onClick={handleDeleteClick}
                    className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <MdDelete className="w-4 h-4" />
                    Delete Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </Box>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-booking-modal"
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
            maxWidth: '500px',
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
                Edit Booking Dates
              </Typography>
              <IconButton onClick={() => setEditModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-80px)]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={editFormData.startDate}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {selectedBooking?.booking_start_date ? formatDate(selectedBooking.booking_start_date) : "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={editFormData.endDate}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={editFormData.startDate || new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {selectedBooking?.booking_end_date ? formatDate(selectedBooking.booking_end_date) : "N/A"}
                </p>
              </div>

              {editFormData.startDate && editFormData.endDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    New duration: {
                      Math.ceil(
                        (new Date(editFormData.endDate).getTime() - new Date(editFormData.startDate).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )
                    } days
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Current duration: {selectedBooking?.duration_days || 0} days
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MdEdit className="w-4 h-4" />
                Update Dates
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle className="bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <MdDelete className="w-5 h-5" />
            Confirm Delete
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-700">
            Are you sure you want to delete this booking? This action cannot be undone and will permanently remove the booking from the system.
          </DialogContentText>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700 font-medium">Warning:</p>
            <p className="text-xs text-red-600 mt-1">
              • All booking data will be permanently deleted<br />
              • Any associated transactions will be marked as cancelled<br />
              • This action may affect reporting and analytics
            </p>
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t border-gray-200">
          <button
            onClick={() => setDeleteConfirmOpen(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            autoFocus
          >
            <MdDelete className="w-4 h-4" />
            Delete Booking
          </button>
        </DialogActions>
      </Dialog>

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
    </div>
  ); 
};

export default AdminBooking;