import React, { useState, useEffect } from "react";
import { MdLocationOn } from "react-icons/md";
import DatePicker from "react-datepicker";
import useAgentStore from "../../../../stores/agentstore";
import useAdminStore from "../../../../stores/admin";
import useBookingStore from "../../../../stores/bookingStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string | number;
  price: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  apartmentId?: string;
  location?: string;
  amenities?: string[];
  agentId: string;
}

interface BookingRange {
  start_date: string;
  end_date: string;
}

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date: Date): string => {
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to normalize a date to midnight (remove time component)
const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Helper to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return getDateString(date1) === getDateString(date2);
};

// Parse backend date - extract only YYYY-MM-DD
const parseBackendDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  
  // Extract just the YYYY-MM-DD part
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  
  return new Date(year, month - 1, day);
};

// Calculate nights for a date range
const calculateRangeNights = (start: Date, end: Date): number => {
  const timeDiff = end.getTime() - start.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  return Math.floor(dayDiff) + 1; // +1 to include both start and end dates
};

// Helper function to group consecutive dates into ranges
const groupConsecutiveDates = (dates: Date[]): {start: Date, end: Date}[] => {
  if (dates.length === 0) return [];
  
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const ranges: {start: Date, end: Date}[] = [];
  
  let currentStart = sortedDates[0];
  let currentEnd = sortedDates[0];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i-1]);
    const nextDay = new Date(prevDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Check if dates are consecutive (same day as next day)
    const currentDateStr = getDateString(sortedDates[i]);
    const nextDayStr = getDateString(nextDay);
    
    if (currentDateStr === nextDayStr) {
      // Dates are consecutive
      currentEnd = sortedDates[i];
    } else {
      // Break in sequence - save current range and start new one
      ranges.push({start: currentStart, end: currentEnd});
      currentStart = sortedDates[i];
      currentEnd = sortedDates[i];
    }
  }
  
  // Don't forget the last range
  ranges.push({start: currentStart, end: currentEnd});
  return ranges;
};

const BookingModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}> = ({ property, isOpen, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateRanges, setDateRanges] = useState<{start: Date, end: Date}[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [bookingRanges, setBookingRanges] = useState<BookingRange[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { offlineBooking } = useAdminStore();
  const { fetchBookingDates, bookingDates, loading, error } = useBookingStore();

  // Update date ranges whenever selectedDates changes
  useEffect(() => {
    if (selectedDates.length > 0) {
      const ranges = groupConsecutiveDates(selectedDates);
      setDateRanges(ranges);
      
      console.log("📅 Date ranges calculated:", ranges.map(r => ({
        start: getDateString(r.start),
        end: getDateString(r.end),
        nights: calculateRangeNights(r.start, r.end)
      })));
    } else {
      setDateRanges([]);
    }
  }, [selectedDates]);

  // Fetch booked dates when modal opens
  useEffect(() => {
    const fetchBookedDates = async (propertyId: string) => {
      try {
        setLoadingBookedDates(true);
        console.log("🔄 Fetching booked dates for property:", propertyId);

        setBookedDates([]);
        setBookingRanges([]);
        
        const dates = await fetchBookingDates(propertyId);
        
        const dateStrings: string[] = [];
        const ranges: BookingRange[] = [];

        if (dates && dates.length > 0) {
          console.log("📅 Raw booking dates from API:", dates);
          
          dates.forEach((bookingDate: any, index: number) => {
            const startDateStr = bookingDate.start_date;
            const endDateStr = bookingDate.end_date;
            
            if (startDateStr && endDateStr) {
              try {
                // Parse dates using simple extraction
                const startDateLocal = parseBackendDate(startDateStr);
                const endDateLocal = parseBackendDate(endDateStr);
                
                console.log(`📅 Processing booking ${index + 1}:`, {
                  rawStart: startDateStr,
                  rawEnd: endDateStr,
                  startFormatted: getDateString(startDateLocal),
                  endFormatted: getDateString(endDateLocal)
                });
                
                if (!isNaN(startDateLocal.getTime()) && !isNaN(endDateLocal.getTime())) {
                  const startDateFormatted = getDateString(startDateLocal);
                  const endDateFormatted = getDateString(endDateLocal);
                  
                  // Store the range
                  ranges.push({
                    start_date: startDateFormatted,
                    end_date: endDateFormatted
                  });
                  
                  // Generate all dates in the range
                  const currentDate = new Date(startDateLocal);
                  while (currentDate <= endDateLocal) {
                    const dateString = getDateString(currentDate);
                    if (!dateStrings.includes(dateString)) {
                      dateStrings.push(dateString);
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                } else {
                  console.warn(`❌ Invalid dates in booking ${index + 1}:`, { startDateStr, endDateStr });
                }
              } catch (error) {
                console.error(`❌ Error parsing dates ${startDateStr} to ${endDateStr}:`, error);
              }
            } else {
              console.warn(`❌ Missing date fields in booking ${index + 1}:`, bookingDate);
            }
          });
        } else {
          console.log("📅 No booking dates found for this property");
        }

        // Remove duplicates and sort
        const uniqueDates = [...new Set(dateStrings)].sort();
        
        console.log("📅 Final booked dates:", uniqueDates);
        console.log("📅 Booking ranges:", ranges);
        console.log(`📅 Total dates to block: ${uniqueDates.length}`);
        
        setBookedDates(uniqueDates);
        setBookingRanges(ranges);
        
      } catch (error) {
        console.error("❌ Error fetching booked dates:", error);
        toast.warning(
          "Unable to load booked dates. Some dates may be unavailable.",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        setBookedDates([]);
        setBookingRanges([]);
      } finally {
        setLoadingBookedDates(false);
      }
    };

    if (property && isOpen && property.id) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen, fetchBookingDates]);

  // Clear dates when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDates([]);
      setDateRanges([]);
      setBookedDates([]);
      setBookingRanges([]);
    }
  }, [isOpen]);

  const isDateBooked = (date: Date) => {
    if (!date || bookedDates.length === 0) {
      return false;
    }

    const dateStr = getDateString(date);
    
    // Check if the exact date is marked as booked
    const isExactDateBooked = bookedDates.includes(dateStr);
    
    if (isExactDateBooked) {
      return true;
    }
    
    // Also check if the date falls within any booking range
    for (const range of bookingRanges) {
      try {
        const rangeStart = parseBackendDate(range.start_date + 'T00:00:00');
        const rangeEnd = parseBackendDate(range.end_date + 'T00:00:00');
        const checkDate = parseBackendDate(dateStr + 'T00:00:00');
        
        if (checkDate >= rangeStart && checkDate <= rangeEnd) {
          return true;
        }
      } catch (error) {
        console.error(`Error checking date range:`, error);
      }
    }
    
    return false;
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      isSameDay(selectedDate, date)
    );
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    // Create a clean date without time component
    const cleanDate = normalizeDate(date);
    const dateStr = getDateString(cleanDate);
    
    console.log(`📅 User selected date: ${dateStr}`);

    if (isDateBooked(cleanDate)) {
      toast.info("This date is already booked. Please select another date.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const dateIndex = selectedDates.findIndex((selectedDate) => {
      return isSameDay(selectedDate, cleanDate);
    });

    if (dateIndex >= 0) {
      // Remove date if already selected
      const newDates = selectedDates.filter((_, index) => index !== dateIndex);
      setSelectedDates(newDates);
      console.log(`📅 Removed date: ${dateStr}, Total selected: ${newDates.length}`);
    } else {
      // Add date
      const newDates = [...selectedDates, cleanDate].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      setSelectedDates(newDates);
      console.log(`📅 Added date: ${dateStr}, Total selected: ${newDates.length}`);
    }
  };

  const calculateTotalNights = (): number => {
    if (dateRanges.length === 0) return 0;
    
    let totalNights = 0;
    
    dateRanges.forEach(range => {
      totalNights += calculateRangeNights(range.start, range.end);
    });
    
    return totalNights;
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const convertToBookingFormat = (
    ranges: {start: Date, end: Date}[]
  ): { startDates: string[]; endDates: string[] } => {
    if (ranges.length === 0) {
      throw new Error("No dates selected for booking");
    }

    const startDates: string[] = [];
    const endDates: string[] = [];
    
    // For each range, send start and end dates
    ranges.forEach((range, index) => {
      const startStr = getDateString(range.start);
      const endStr = getDateString(range.end);
      const nights = calculateRangeNights(range.start, range.end);
      
      startDates.push(startStr);
      endDates.push(endStr);
      
      console.log(`📅 Range ${index + 1}: ${startStr} to ${endStr} (${nights} nights)`);
    });
    
    console.log("📤 Sending to backend as ranges:", {
      startDates,
      endDates,
      totalRanges: ranges.length
    });
    
    return { startDates, endDates };
  };

  const renderDayContents = (day: number, date: Date) => {
    // Create a clean date without time component
    const cleanDate = normalizeDate(date);
    const isBooked = isDateBooked(cleanDate);
    const isSelected = isDateSelected(cleanDate);
    
    // Create today for comparison
    const today = new Date();
    const cleanToday = normalizeDate(today);
    const isToday = cleanDate.getTime() === cleanToday.getTime();
    const isPast = cleanDate < cleanToday && !isToday;

    const handleDateClick = () => {
      if (!isBooked && !isPast) {
        handleDateChange(date);
      }
    };

    return (
      <div
        className={`relative flex items-center justify-center w-8 h-8 rounded-full text-sm
      ${isToday ? "bg-blue-100 font-semibold" : ""}
      ${isSelected ? "bg-blue-600 text-white" : ""}
      ${
        isBooked
          ? "bg-red-100 text-red-600 cursor-not-allowed"
          : isPast
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer"
      }
      transition-colors duration-200
    `}
        onClick={handleDateClick}
        onMouseEnter={() =>
          !isBooked && !isPast && setHoveredDate(cleanDate)
        }
        onMouseLeave={() => setHoveredDate(null)}
        title={
          isBooked
            ? "Already booked - This date is unavailable"
            : isPast
            ? "Cannot select past dates"
            : isSelected
            ? "Selected - click to remove"
            : "Click to select"
        }>
        {day}
        {isBooked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
    );
  };

  const validateForm = () => {
    const requiredFields = [
      { field: bookingData.name, message: "Full name is required" },
      { field: bookingData.phone, message: "Phone number is required" },
      { field: bookingData.email, message: "Email is required" },
      
    ];

    for (const { field, message } of requiredFields) {
      if (!field?.trim()) {
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (bookingData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }


    if (selectedDates.length === 0) {
      toast.error("Please select at least one date", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      toast.error("Please select at least one date", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!property) {
      toast.error("Property information is missing", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const hasBookedDate = selectedDates.some((date) => isDateBooked(date));
    if (hasBookedDate) {
      toast.error(
        "Some selected dates are already booked. Please choose different dates.",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const totalNights = calculateTotalNights();
      const totalAmount = property.price * totalNights;

      // Convert date ranges to booking format
      const { startDates, endDates } = convertToBookingFormat(dateRanges);


      // Build payload matching API structure exactly
      const bookingPayload = {
        name: bookingData.name,
        email: bookingData.email,
        apartmentId: property.id,
        startDates: startDates,
        endDates: endDates,
      };

      const result = await offlineBooking(bookingPayload);

      console.log("✅ Multi-date range booking successful:", result);

      toast.success(`Booking created for ${totalNights} night(s) across ${dateRanges.length} range(s)!`, {
        position: "top-right",
        autoClose: 3000,
      });

      const bookingInfo = {
        ...bookingData,
        propertyId: property.id,
        propertyName: property.name,
        selectedDates: selectedDates.map(d => getDateString(d)),
        dateRanges: dateRanges.map(r => ({
          start: getDateString(r.start),
          end: getDateString(r.end),
          nights: calculateRangeNights(r.start, r.end)
        })),
        totalNights: totalNights,
        totalPrice: totalAmount,
        bookingResult: result,
      };

      onSubmit(bookingInfo);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("❌ Offline booking error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Booking failed. Please try again.";
      
      toast.error(`Booking failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookingData({
      name: "",
      phone: "",
      
      email: "",
    });
    setSelectedDates([]);
    setDateRanges([]);
    setBookedDates([]);
    setBookingRanges([]);
    setHoveredDate(null);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const totalNights = calculateTotalNights();
  const totalAmount = property.price * totalNights;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {property.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={property.images && property.images.length > 0 ? property.images[0] : "/images/house1.svg"}
                  alt={property.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MdLocationOn size={14} />
                    <span>{property.address}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>Type: {property.type}</div>
                <div>Price: NGN {property.price.toLocaleString()}/night</div>
                <div>Booked dates: {bookedDates.length} date(s)</div>
                <div>Selected: {selectedDates.length} date(s) in {dateRanges.length} range(s)</div>
                {bookedDates.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Booked Dates Preview:
                    </div>
                    <div className="text-xs bg-red-50 p-2 rounded border border-red-100 max-h-24 overflow-y-auto">
                      {bookedDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>{date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>

              <div>
                <input
                  type="text"
                  required
                  value={bookingData.name}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Phone Number"
                  disabled={isSubmitting}
                />
              </div>

             

              <div>
                <input
                  type="email"
                  required
                  value={bookingData.email}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Dates
              </h3>

              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full relative">
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                  <span>Past</span>
                </div>
              </div>

              {loadingBookedDates ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading availability...
                  </span>
                </div>
              ) : (
                <>
                  <DatePicker
                    selected={null}
                    onChange={handleDateChange}
                    inline
                    className="w-full"
                    minDate={normalizeDate(new Date())}
                    dateFormat="yyyy/MM/dd"
                    renderDayContents={renderDayContents}
                    filterDate={(date) => {
                      const cleanDate = normalizeDate(date);
                      const isBooked = isDateBooked(cleanDate);
                      const isPast = cleanDate < normalizeDate(new Date());
                      return !isBooked && !isPast;
                    }}
                    dayClassName={(date) => {
                      const cleanDate = normalizeDate(date);
                      if (isDateBooked(cleanDate)) {
                        return "react-datepicker__day--disabled";
                      }
                      return "";
                    }}
                  />

                  {hoveredDate && (
                    <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg top-4 right-4">
                      {isDateBooked(hoveredDate) ? (
                        <>
                          <div className="font-semibold">Already Booked</div>
                          <div className="text-gray-300">
                            Please pick another date
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">Available</div>
                          <div className="text-gray-300">
                            Click to select this date
                          </div>
                        </>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {hoveredDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -top-1 right-6"></div>
                    </div>
                  )}
                </>
              )}

              {selectedDates.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="font-semibold text-gray-900">
                        Booking Summary:
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {dateRanges.length} range(s) selected
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-600 font-medium block">
                        {totalNights} night{totalNights > 1 ? "s" : ""} total
                      </span>
                      <span className="text-xs text-gray-500">
                        Across {dateRanges.length} booking{dateRanges.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {dateRanges.map((range, index) => {
                      const checkInDate = formatDisplayDate(range.start);
                      const checkOutDate = new Date(range.end);
                      checkOutDate.setDate(checkOutDate.getDate() + 1);
                      const checkOutDateStr = formatDisplayDate(checkOutDate);
                      const rangeNights = calculateRangeNights(range.start, range.end);
                      const rangeAmount = property.price * rangeNights;
                      
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-sm text-gray-700">
                                Booking {index + 1}
                              </span>
                              <div className="text-xs text-gray-500">
                                {rangeNights} night{rangeNights > 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                                {getDateString(range.start)}
                              </span>
                              <span className="text-xs text-gray-500">to</span>
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                {getDateString(range.end)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Check-in:</span>
                              <span>
                                {checkInDate} at 1:00 PM
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Check-out:</span>
                              <span>
                                {checkOutDateStr} at 12:00 PM
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span>{rangeNights} night{rangeNights > 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600">Range Amount:</span>
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(rangeAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {property.price && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per night:</span>
                        <span className="text-gray-900">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(property.price)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Amount ({totalNights} nights):</span>
                        <span className="text-green-600">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(totalAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedDates.length === 0 || loadingBookedDates}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Book ${totalNights} Night${totalNights > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AvailableProperty = () => {
  const { publicProperties, fetchPublicProperties, loading, error } =
    useAgentStore();
    
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchPublicProperties(1, 12);
  }, [fetchPublicProperties]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load properties: ${error}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  const handleBookNow = (property: any) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log("✅ Booking submitted successfully:", bookingData);
      toast.success("Booking completed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to process booking:", error);
    }
  };

  if (loading && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative h-48 bg-gray-200"></div>
                <div className="bg-white p-4">
                  <div className="flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {publicProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary-200 group"
            >
              <div className="relative h-48">
                <img
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "/images/house1.svg"
                  }
                  alt={property.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/house1.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="absolute bottom-3 left-3">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                    NGN {parseInt(property.price as any).toLocaleString()}/Night
                  </span>
                </div>
              </div>

              <div className="bg-white p-4">
                <div className="flex flex-col gap-3">
                  <h5 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.name}
                  </h5>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MdLocationOn size={16} className="text-primary-600" />
                    <span className="text-sm">{property.address}</span>
                  </div>

<div className="flex flex-wrap gap-2">
  {(() => {
    // Try to parse amenities if they're a JSON string
    let amenitiesArray: string[] = [];
    
    if (property.amenities) {
      if (typeof property.amenities === 'string') {
        try {
          amenitiesArray = JSON.parse(property.amenities);
        } catch (e) {
          // If parsing fails, treat it as a string array or split by comma
          amenitiesArray = (property.amenities as string).split(',').map((a: string) => a.trim().replace(/["']/g, ''));
        }
      } else if (Array.isArray(property.amenities)) {
        amenitiesArray = property.amenities;
      }
    }
    
    if (amenitiesArray.length === 0) {
      return (
        <span className="text-xs text-gray-400 italic">No amenities listed</span>
      );
    }
    
    return (
      <>
        {amenitiesArray.slice(0, 3).map((amenity, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
          >
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            {amenity}
          </div>
        ))}
        {amenitiesArray.length > 3 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <span className="text-gray-400">+</span>
            {amenitiesArray.length - 3}
          </div>
        )}
      </>
    );
  })()}
</div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-medium capitalize">
                        {property.status || "Available"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookNow(property)}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {publicProperties.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No properties available at the moment.
            </p>
          </div>
        )}
      </div>

      <BookingModal
        property={selectedProperty}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
      />
    </>
  );
};

export default AvailableProperty;