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
  Snackbar,
  useMediaQuery,
  useTheme as useMuiTheme
} from "@material-ui/core";
import {
  Alert,
  ThemeProvider,
  createTheme
} from "@mui/material";
import MaterialTable, { Column } from "material-table";
import useAgentStore from "../../../../../stores/agentstore";
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
  DELETED = 'DELETED',
  CURRENTLY_HOSTING = 'CURRENTLY_HOSTING',
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
  apartment?: {
    name: string;
    address: string;
    type: string;
  }
}

const BookingViewModal: React.FC<BookingViewModalProps> = ({ open, onClose }) => {
  const {
    agentBookings,
    bookingsLoading,
    error,
    fetchAgentBookings,
    clearError
  } = useAgentStore();
  
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));
  
  type BookingType = typeof agentBookings[0];
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
      fetchAgentBookings();
    }
  }, [open, fetchAgentBookings]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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

  const formatCheckOutDate = (checkInDate: string | Date, checkOutDate: string | Date) => {
    if (!checkInDate || !checkOutDate) return formatDate(checkOutDate);
    
    try {
      const checkIn = typeof checkInDate === 'string' ? new Date(checkInDate) : checkInDate;
      const checkOut = typeof checkOutDate === 'string' ? new Date(checkOutDate) : checkOutDate;
      
      const adjustedCheckOut = new Date(checkOut);
      adjustedCheckOut.setDate(adjustedCheckOut.getDate() + 1);
      adjustedCheckOut.setHours(12, 0, 0, 0);
      
      return formatDate(adjustedCheckOut);
    } catch {
      return formatDate(checkOutDate);
    }
  };

  const formatCurrency = (amount: any) => {
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getStatusColor = (status: string = "") => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("success") || 
        statusLower.includes("complete") || 
        statusLower.includes("booked")) {
      return "#1ED75A";
    } else if (statusLower.includes("deleted") || 
               statusLower.includes("cancel")) {
      return "#FF0909";
    } else if (statusLower.includes("currently") || 
               statusLower.includes("hosting")) {
      return "#4A90E2";
    } else if (statusLower.includes("upcoming")) {
      return "#00BCD4";
    } else if (statusLower.includes("pending")) {
      return "#15ff00ff";
    } else {
      return "#6B7280";
    }
  };
  
  const getStatusText = (status: string = "") => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("success") || 
        statusLower.includes("complete") || 
        statusLower.includes("booked")) {
      return "Successful";
    } else if (statusLower.includes("deleted")) {
      return "Deleted";
    } else if (statusLower.includes("currently") || 
               statusLower.includes("hosting")) {
      return "Currently Hosting";
    } else if (statusLower.includes("pending")) {
      return "Pending";
    } else if (statusLower.includes("upcoming")) {
      return "Upcoming";
    } else if (statusLower.includes("cancel")) {
      return "Deleted";
    } else {
      return status || "Unknown";
    }
  };

  const getCustomerName = (booking: any) => {
    return booking?.transaction?.metadata?.fullName || 
           booking?.guest_name || 
           booking?.transaction?.email || 
           "N/A";
  };

  const getPhoneNumber = (booking: any) => {
    return booking?.transaction?.phone_number || 
           booking?.guest_phone || 
           "N/A";
  };

  const getNextOfKin = (booking: any) => {
    const metadata = booking?.transaction?.metadata;
    if (!metadata) return { name: "N/A", number: "N/A" };
    
    return {
      name: metadata.nextOfKinName || metadata.nextofKinName || metadata.next_of_kin_name || "N/A",
      number: metadata.nextOfKinNumber || metadata.nextofKinNumber || metadata.next_of_kin_number || "N/A"
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
    const duration = booking.transaction?.duration_days || booking.duration_days || 0;
    return {
      note: `Booking (${duration} days)`
    };
  };

  const getApartmentAgent = (booking: any) => {
    return "Agent Name";
  };

  const getFilteredCounts = useMemo(() => {
    const counts = {
      successful: 0,
      deleted: 0,
      currentlyHosting: 0,
      upcoming: 0,
      pending: 0,
    };

    if (!agentBookings.length) return counts;

    agentBookings.forEach(booking => {
      const status = booking.status?.toLowerCase() || "";
      const transactionStatus = booking.transaction?.status?.toLowerCase() || "";
      
      if (status.includes("booked") || 
          status.includes("success") || 
          status.includes("complete") ||
          transactionStatus.includes("success")) {
        counts.successful++;
      } else if (status.includes("deleted") ||
                 status.includes("cancel") ||
                 transactionStatus.includes("deleted")) {
        counts.deleted++;
      } else if (status.includes("currently") ||
                 status.includes("hosting")) {
        counts.currentlyHosting++;
      } else if (status.includes("pending") ||
                 transactionStatus.includes("pending")) {
        counts.pending++;
      } else if (status.includes("upcoming")) {
        counts.upcoming++;
      }
    });

    return counts;
  }, [agentBookings]);

  const createTableData = useCallback(() => {
    if (!agentBookings.length) return [];

    const getFilteredBookings = () => {
      switch (activeTab) {
        case 0:
          return agentBookings.filter(booking => {
            const status = booking.status?.toLowerCase() || "";
            const transactionStatus = booking.transaction?.status?.toLowerCase() || "";
            
            return status.includes("booked") || 
                   status.includes("success") || 
                   status.includes("complete") ||
                   transactionStatus.includes("success") ||
                   status.includes("deleted") || 
                   status.includes("cancel") ||
                   transactionStatus.includes("deleted");
          });
        case 1:
          return agentBookings.filter(booking => {
            const status = booking.status?.toLowerCase() || "";
            const transactionStatus = booking.transaction?.status?.toLowerCase() || "";
            
            return (status.includes("currently") || 
                    status.includes("hosting") ||
                    status.includes("upcoming") ||
                    status.includes("pending") ||
                    transactionStatus.includes("pending")) &&
                   !status.includes("booked") &&
                   !status.includes("success") &&
                   !transactionStatus.includes("success") &&
                   !status.includes("deleted") &&
                   !transactionStatus.includes("deleted");
          });
        default:
          return agentBookings;
      }
    };

    const filteredBookings = getFilteredBookings();

    return filteredBookings.map((booking): TableRowData => {
      const status = booking.status || "Unknown";
      const transactionStatus = booking.transaction?.status || "N/A";
      const apartmentName = booking.apartment?.name || "N/A";
      const bookingDetails = getApartmentDetails(booking);
      
      const checkInDate = booking.transaction?.booking_start_date || "";
      let formattedCheckIn = "N/A";
      if (checkInDate) {
        try {
          const checkIn = typeof checkInDate === 'string' ? new Date(checkInDate) : checkInDate;
          const checkInWith1PM = new Date(checkIn);
          checkInWith1PM.setHours(13, 0, 0, 0);
          formattedCheckIn = formatDate(checkInWith1PM);
        } catch {
          formattedCheckIn = formatDate(checkInDate);
        }
      }
      
      const apartment = booking.apartment ? {
        name: booking.apartment.name,
        address: booking.apartment.address,
        type: booking.apartment.type,
      } : undefined;
      
      return {
        id: booking.id,
        customer: getCustomerName(booking),
        apartment_booked: apartmentName,
        date: formatDate(booking.created_at || ""),
        phone_number: getPhoneNumber(booking),
        check_in: formattedCheckIn,
        check_out: formatCheckOutDate(
          booking.transaction?.booking_start_date || "", 
          booking.transaction?.booking_end_date || ""
        ),
        apartment_agent: getApartmentAgent(booking),
        status: status,
        displayStatus: getStatusText(status),
        transaction_status: transactionStatus,
        amount: booking.transaction?.amount || 0,
        note: bookingDetails.note,
        originalBooking: booking,
        isDeleted: status.toLowerCase().includes("deleted") || false,
        isEditable: false,
        apartment: apartment
      };
    });
  }, [agentBookings, activeTab]);

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

  const updateFilteredData = useCallback(() => {
    let tableData = createTableData();
    
    if (statusFilter !== 'ALL') {
      tableData = tableData.filter(row => {
        const status = row.status.toLowerCase();
        const displayStatus = row.displayStatus.toLowerCase();
        
        switch (statusFilter) {
          case BookingStatus.SUCCESSFUL:
            return status.includes("booked") || 
                   status.includes("success") || 
                   status.includes("complete") ||
                   displayStatus.includes("success");
          case BookingStatus.DELETED:
            return status.includes("deleted") || 
                   status.includes("cancel") ||
                   displayStatus.includes("deleted") ||
                   row.isDeleted;
          case BookingStatus.CURRENTLY_HOSTING:
            return status.includes("currently") || 
                   status.includes("hosting") ||
                   displayStatus.includes("currently");
          case BookingStatus.UPCOMING:
            return status.includes("upcoming") || 
                   displayStatus.includes("upcoming");
          case BookingStatus.PENDING:
            return status.includes("pending") || 
                   displayStatus.includes("pending");
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
    const originalBooking = agentBookings.find(booking => booking.id === rowData.id);
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
    setShowStatusFilter(false);
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
        row.status.toLowerCase().includes("booked") ||
        row.status.toLowerCase().includes("success") || 
        row.status.toLowerCase().includes("complete") ||
        row.displayStatus.toLowerCase().includes("success")
      ).length 
    },
    { 
      value: BookingStatus.DELETED, 
      label: 'Deleted', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("deleted") || 
        row.status.toLowerCase().includes("cancel") ||
        row.displayStatus.toLowerCase().includes("deleted") ||
        row.isDeleted
      ).length 
    },
  ];

  const bookingRequestStatusFilterOptions = [
    { value: 'ALL' as const, label: 'All Status', count: filteredData.length },
    { 
      value: BookingStatus.CURRENTLY_HOSTING, 
      label: 'Currently Hosting', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("currently") ||
        row.status.toLowerCase().includes("hosting") ||
        row.displayStatus.toLowerCase().includes("currently")
      ).length 
    },
    { 
      value: BookingStatus.UPCOMING, 
      label: 'Upcoming', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("upcoming") || 
        row.displayStatus.toLowerCase().includes("upcoming")
      ).length 
    },
    { 
      value: BookingStatus.PENDING, 
      label: 'Pending', 
      count: filteredData.filter(row => 
        row.status.toLowerCase().includes("pending") ||
        row.displayStatus.toLowerCase().includes("pending")
      ).length 
    }
  ];

  const getCurrentStatusFilterOptions = () => {
    return activeTab === 0 ? bookingDetailsStatusFilterOptions : bookingRequestStatusFilterOptions;
  };

  // Responsive column configuration
  const getBookingDetailsColumns = (): Column<TableRowData>[] => {
    const baseColumns: Column<TableRowData>[] = [
      {
        title: "PROPERTY",
        field: "customer",
        cellStyle: { paddingLeft: "2%" },
        render: (rowData: TableRowData) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 text-sm truncate">
              {rowData.apartment?.name || rowData.apartment_booked || "N/A"}
            </span>
            <div className="text-xs text-gray-400 mt-1 truncate">({rowData.note})</div>
          </div>
        ),
        width: isMobile ? 120 : isTablet ? 140 : 150,
        hidden: isMobile ? false : false
      },
      {
        title: "CUSTOMER",
        field: "customer",
        cellStyle: { paddingLeft: "2%" },
        render: (rowData: TableRowData) => (
          <div className="font-medium text-gray-800 text-sm truncate">{rowData.customer}</div>
        ),
        width: isMobile ? 120 : isTablet ? 140 : 150,
        hidden: isMobile ? false : false
      },
      {
        title: "PHONE",
        field: "phone_number",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="text-gray-700 text-sm truncate">{rowData.phone_number}</div>
        ),
        width: isMobile ? 100 : 120,
        hidden: isMobile ? false : false
      },
      {
        title: "DATE",
        field: "date",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="text-gray-700 text-sm truncate">{rowData.date}</div>
        ),
        width: isMobile ? 140 : 160,
        hidden: isMobile ? true : false
      },
      {
        title: "CHECK IN",
        field: "check_in",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="text-gray-700 text-sm truncate">{rowData.check_in}</div>
        ),
        width: isMobile ? 140 : 160,
        hidden: isMobile ? true : false
      },
      {
        title: "CHECK OUT",
        field: "check_out",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="text-gray-700 text-sm truncate">{rowData.check_out}</div>
        ),
        width: isMobile ? 140 : 160,
        hidden: isMobile ? true : false
      },
      {
        title: "AMOUNT",
        field: "amount",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="text-gray-700 text-sm font-medium truncate">
            {formatCurrency(rowData.amount)}
          </div>
        ),
        width: isMobile ? 100 : 120,
        hidden: isMobile ? false : false
      },
      {
        title: "STATUS",
        field: "status",
        cellStyle: {},
        render: (rowData: TableRowData) => (
          <div className="font-medium text-sm truncate" style={{ color: getStatusColor(rowData.status) }}>
            {rowData.displayStatus}
          </div>
        ),
        width: isMobile ? 100 : 120,
        hidden: isMobile ? false : false
      }
    ];

    return baseColumns;
  };

  const getBookingRequestColumns = (): Column<TableRowData>[] => {
    return getBookingDetailsColumns();
  };

  const defaultMaterialTheme = createTheme({
    palette: {},
  });

  // Mobile-friendly detail modal content
  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(95vh-80px)] bg-white">
        {/* Customer Information */}
        <div className="space-y-3 sm:space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg">
            Customer Information
          </Typography>
          
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Guest Name
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {getCustomerName(selectedBooking)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Phone Number
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {getPhoneNumber(selectedBooking)}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Email
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base truncate">
                  {selectedBooking.transaction?.email || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Next of Kin Name
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {getNextOfKin(selectedBooking).name}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="space-y-3 sm:space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg">
            Booking Information
          </Typography>
          
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Booking Date
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {formatDate(selectedBooking.created_at || "")}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Check in
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {(() => {
                    const checkInDate = selectedBooking.transaction?.booking_start_date || "";
                    if (!checkInDate) return "N/A";
                    try {
                      const checkIn = typeof checkInDate === 'string' ? new Date(checkInDate) : checkInDate;
                      const checkInWith1PM = new Date(checkIn);
                      checkInWith1PM.setHours(13, 0, 0, 0);
                      return formatDate(checkInWith1PM);
                    } catch {
                      return formatDate(checkInDate);
                    }
                  })()}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Duration
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {selectedBooking.transaction?.duration_days || 0} days
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Check out
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {formatCheckOutDate(
                    selectedBooking.transaction?.booking_start_date || "",
                    selectedBooking.transaction?.booking_end_date || ""
                  )}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Information */}
        <div className="space-y-3 sm:space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg">
            Transaction Information
          </Typography>
          
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Transaction Reference
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base font-mono truncate">
                  {selectedBooking.transaction?.reference || "N/A"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Transaction Status
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {selectedBooking.transaction?.status || "N/A"}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Total Amount
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {formatCurrency(selectedBooking.transaction?.amount || 0)}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 sm:space-y-4">
          <Typography variant="h6" className="font-semibold text-black text-lg">
            Booking Details
          </Typography>
          
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Booking ID
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base font-mono truncate">
                  {selectedBooking.id}
                </Typography>
              </div>
              
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Status
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base" 
                  style={{ color: getStatusColor(selectedBooking.status) }}>
                  {getStatusText(selectedBooking.status)}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-xs sm:text-sm font-medium mb-1 text-gray-700">
                  Price Markup
                </Typography>
                <Typography variant="body1" className="font-semibold text-black text-sm sm:text-base">
                  {getBookingDetails(selectedBooking).isMarkedUp ? "Yes" : "None"}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Modal */}
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
            width: isMobile ? '100vw' : isTablet ? '90vw' : '95%',
            height: isMobile ? '100vh' : '95vh',
            maxWidth: '1200px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: isMobile ? 0 : '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
            margin: isMobile ? 0 : 'auto',
          }}
          className="bg-white"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-lg sm:text-xl truncate">
                Agent Booking Management
              </Typography>
              <IconButton onClick={onClose} size="small" className="ml-2">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-64px)] sm:h-[calc(95vh-80px)] overflow-hidden">
            {/* Tabs and Filters Section */}
            <div className="flex-shrink-0 p-4 sm:p-6 pb-0">
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant={isMobile ? "fullWidth" : "standard"}
                className="w-full"
              >
                <Tab 
                  label={
                    <span className="font-bold text-sm sm:text-base truncate">
                      Agent Booking Details
                    </span>
                  }
                  className={`min-w-0 ${isMobile ? '' : 'mr-6'} ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}
                />
                <Tab 
                  label={
                    <span className="font-bold text-sm sm:text-base truncate">
                      Agent Booking Request
                    </span>
                  }
                  className={`min-w-0 ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}
                />
              </Tabs>
              
              {/* Status Counters */}
              <div className="bg-white rounded-t-[12px] sm:rounded-t-[20px] p-3 sm:p-4 mt-3 sm:mt-4">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="bg-[#4EC368] rounded-[8px] sm:rounded-[12px] text-white px-3 sm:px-6 py-2 text-xs sm:text-sm whitespace-nowrap">
                    {activeTab === 0 ? 'Successful' : 'Currently Hosting'} 
                    <span className="ml-1 font-bold">({activeTab === 0 ? getFilteredCounts.successful : getFilteredCounts.currentlyHosting})</span>
                  </div>
                  <div className={`${activeTab === 0 ? 'bg-[#FF0909]' : 'bg-[#4A90E2]'} rounded-[8px] sm:rounded-[12px] text-white px-4 sm:px-8 py-2 text-xs sm:text-sm whitespace-nowrap`}>
                    {activeTab === 0 ? 'Deleted' : 'Upcoming'}
                    <span className="ml-1 font-bold">({activeTab === 0 ? getFilteredCounts.deleted : getFilteredCounts.upcoming})</span>
                  </div>
                </div>
              </div>

              {/* Status Filter Panel */}
              {showStatusFilter && (
                <div className="flex flex-col gap-3 p-3 sm:p-4 bg-gray-50 mt-3 sm:mt-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MdFilterList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentStatusFilterOptions().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          statusFilter === option.value
                            ? option.value === 'ALL' 
                              ? 'bg-blue-600 text-white'
                              : option.value === BookingStatus.SUCCESSFUL
                              ? 'bg-green-600 text-white'
                              : option.value === BookingStatus.DELETED
                              ? 'bg-red-600 text-white'
                              : option.value === BookingStatus.CURRENTLY_HOSTING
                              ? 'bg-blue-500 text-white'
                              : option.value === BookingStatus.UPCOMING
                              ? 'bg-teal-500 text-white'
                              : option.value === BookingStatus.PENDING
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label} 
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 pt-3 sm:pt-4">
              <TabPanel value={activeTab} index={0}>
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
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4">
                                {/* Search Input */}
                                <div className="relative w-full sm:flex-1 sm:max-w-md">
                                  <div className="relative">
                                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    <input
                                      type="text"
                                      placeholder="Search bookings..." 
                                      value={searchText}
                                      onChange={handleSearchChange}
                                      className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                    {searchText && (
                                      <button
                                        onClick={clearSearch}
                                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      >
                                        <MdClose className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Filter Button */}
                                <button
                                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                        columns={getBookingDetailsColumns()}
                        data={filteredData}
                        title=""
                        onRowClick={handleRowClick}
                        options={{
                          paging: true,
                          pageSize: isMobile ? 5 : 10,
                          pageSizeOptions: [5, 10, 20, 50],
                          search: false,
                          rowStyle: {
                            color: "#474E70",
                            backgroundColor: "transparent",
                            fontWeight: 400,
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "12px 4px" : "16px 5px",
                            cursor: "pointer",
                            borderBottom: "1px solid #E8E9ED",
                          },
                          headerStyle: {
                            color: "#000",
                            fontWeight: 600,
                            fontSize: isMobile ? "12px" : "14px",
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
                          exportButton: !isMobile,
                          minBodyHeight: isMobile ? "200px" : "300px",
                          maxBodyHeight: isMobile ? "400px" : "500px",
                          tableLayout: isMobile ? 'fixed' : 'auto',
                          padding: isMobile ? 'dense' : 'default',
                        }}
                      />
                    </div>
                  </ThemeProvider>
                </div>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
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
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4">
                                <div className="relative w-full sm:flex-1 sm:max-w-md">
                                  <div className="relative">
                                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    <input
                                      type="text"
                                      placeholder="Search booking requests..." 
                                      value={searchText}
                                      onChange={handleSearchChange}
                                      className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                    {searchText && (
                                      <button
                                        onClick={clearSearch}
                                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      >
                                        <MdClose className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                        columns={getBookingRequestColumns()}
                        data={filteredData}
                        title=""
                        onRowClick={handleRowClick}
                        options={{
                          paging: true,
                          pageSize: isMobile ? 5 : 10,
                          pageSizeOptions: [5, 10, 20, 50],
                          search: false,
                          rowStyle: {
                            color: "#474E70",
                            backgroundColor: "transparent",
                            fontWeight: 400,
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "12px 4px" : "16px 5px",
                            cursor: "pointer",
                            borderBottom: "1px solid #E8E9ED",
                          },
                          headerStyle: {
                            color: "#000",
                            fontWeight: 600,
                            fontSize: isMobile ? "12px" : "14px",
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
                          exportButton: !isMobile,
                          minBodyHeight: isMobile ? "200px" : "300px",
                          maxBodyHeight: isMobile ? "400px" : "500px",
                          tableLayout: isMobile ? 'fixed' : 'auto',
                          padding: isMobile ? 'dense' : 'default',
                        }}
                      />
                    </div>
                  </ThemeProvider>
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
            width: isMobile ? '100vw' : isTablet ? '90vw' : '95%',
            height: isMobile ? '100vh' : '95vh',
            maxWidth: '800px',
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: isMobile ? 0 : '8px',
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
            margin: isMobile ? 0 : 'auto',
          }}
          className="bg-white"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold text-black text-lg sm:text-xl truncate">
                Agent Booking Details
              </Typography>
              <IconButton onClick={handleCloseDetailModal} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          {selectedBooking && renderBookingDetails()}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          className="shadow-lg max-w-[90vw] sm:max-w-none"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BookingViewModal;