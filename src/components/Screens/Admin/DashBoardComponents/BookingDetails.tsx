import React, { useState, useEffect } from 'react'
import { Paper, ThemeProvider, createTheme } from '@mui/material'
import MaterialTable from 'material-table'
import { Link, useLocation } from 'react-router-dom'
import useBookingStore from '../../../../stores/bookingStore' // Adjust the import path as needed

const BookingDetails = () => {
  const url = useLocation()
  const { pathname } = url
  const pathnames = pathname.split("/").filter((x) => x)
  
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Use the booking store
  const { 
    bookings, 
    loading, 
    error, 
    fetchBookings 
  } = useBookingStore()

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Transform store data to match table format based on actual API response
  const transformBookingData = () => {
    return bookings.map(booking => ({
      id: booking.id,
      customer: booking.guest_name || "Customer", // Fallback if guest_name not in response
      apartment_booked: booking.apartment?.name || "Apartment",
      date: formatDate(booking.created_at),
      phone_number: booking.guest_phone || "+234 000 000 0000",
      check_in: formatDate(booking.booking_start_date),
      check_out: formatDate(booking.booking_end_date),
      apartment_agent: "Agent", // You might want to add agent info to your API
      status: mapStatus(booking.status)
    }))
  }

  // Map backend status to frontend status
  const mapStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'booked': 'Successful',
      'confirmed': 'Successful',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    }
    return statusMap[status] || 'Pending'
  }

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  // Filter data based on selected status
  const filteredData = selectedStatus === 'all' 
    ? transformBookingData() 
    : transformBookingData().filter(booking => 
        booking.status.toLowerCase() === selectedStatus.toLowerCase()
      )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Successful: { color: 'bg-green-100 text-green-800', label: 'Successful' },
      Pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      Rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      Cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const COLUMNS = [
    {
      title: "Customer",
      field: "customer",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-600 font-medium text-sm">
              {rowData.customer?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
            </span>
          </div>
          <span className="font-medium text-gray-900">{rowData.customer || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: "Apartment Booked",
      field: "apartment_booked",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="font-medium text-gray-700">{rowData.apartment_booked || 'N/A'}</div>
      ),
    },
    {
      title: "Booking Date",
      field: "date",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.date || 'N/A'}</div>
      ),
    },
    {
      title: "Phone Number",
      field: "phone_number",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.phone_number || 'N/A'}</div>
      ),
    },
    {
      title: "Check In",
      field: "check_in",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.check_in || 'N/A'}</div>
      ),
    },
    {
      title: "Check Out",
      field: "check_out",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => (
        <div className="text-gray-600">{rowData.check_out || 'N/A'}</div>
      ),
    },
    // {
    //   title: "Agent",
    //   field: "apartment_agent",
    //   cellStyle: { paddingLeft: "20px" },
    //   render: (rowData: any) => (
    //     <div className="font-medium text-gray-700">{rowData.apartment_agent || 'N/A'}</div>
    //   ),
    // },
    {
      title: "Status",
      field: "status",
      cellStyle: { paddingLeft: "20px" },
      render: (rowData: any) => getStatusBadge(rowData.status),
    },
  ]

  const defaultMaterialTheme = createTheme({
    palette: {
      primary: {
        main: '#3B82F6',
      },
    },
    typography: {
      fontFamily: 'inherit',
    },
  })

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
    )
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
              className="ml-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
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
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
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
                  paging: !["dashboard", "home"].every((ai) =>
                    pathnames.includes(ai)
                  )
                    ? true
                    : false,
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
                }}
              />
            </div>
          </ThemeProvider>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails