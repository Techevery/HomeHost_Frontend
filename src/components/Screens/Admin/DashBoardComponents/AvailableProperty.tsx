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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { offlineBooking } = useAdminStore();
  const { fetchBookingDates, bookingDates, loading, error } = useBookingStore();

  // Fetch booked dates when modal opens
  useEffect(() => {
    const fetchBookedDates = async (propertyId: string) => {
      try {
        setLoadingBookedDates(true);
        console.log("🔄 Fetching booked dates for property:", propertyId);

        setBookedDates([]);
        await fetchBookingDates(propertyId);

        const dates: Date[] = [];

        if (bookingDates && bookingDates.length > 0) {
          bookingDates.forEach((bookingDate) => {
            if (bookingDate.booking_start_date && bookingDate.booking_end_date) {
              const start = new Date(bookingDate.booking_start_date);
              const end = new Date(bookingDate.booking_end_date);

              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return;
              }

              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);

              const currentDate = new Date(start);
              while (currentDate <= end) {
                const dateToAdd = new Date(currentDate);
                dates.push(dateToAdd);
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          });
        } 

        const uniqueDates = Array.from(
          new Set(dates.map((date) => date.getTime())),
        ).map((timestamp) => new Date(timestamp));

        uniqueDates.sort((a, b) => a.getTime() - b.getTime());
        setBookedDates(uniqueDates);
      } catch (error) {
        toast.warning(
          "Unable to load booked dates. Some dates may be unavailable.",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        setBookedDates([]);
      } finally {
        setLoadingBookedDates(false);
      }
    };

    if (property && isOpen && property.id) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen, fetchBookingDates, bookingDates]);

  useEffect(() => {
    if (property && isOpen) {
      setBookedDates([]);
    }
  }, [property?.id, isOpen]);

  const isDateBooked = (date: Date) => {
    if (!date || bookedDates.length === 0) return false;

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    const isBooked = bookedDates.some((bookedDate) => {
      if (!bookedDate) return false;

      const normalizedBookedDate = new Date(bookedDate);
      normalizedBookedDate.setHours(0, 0, 0, 0);

      return normalizedBookedDate.getTime() === dateToCheck.getTime();
    });

    return isBooked;
  };

  const isDateSelected = (date: Date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return selectedDates.some((selectedDate) => {
      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);
      return normalizedSelectedDate.getTime() === dateToCheck.getTime();
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (isDateBooked(dateToCheck)) {
      toast.info("This date is already booked. Please select another date.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const dateIndex = selectedDates.findIndex((selectedDate) => {
      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);
      return normalizedSelectedDate.getTime() === dateToCheck.getTime();
    });

    if (dateIndex >= 0) {
      const newDates = selectedDates.filter((_, index) => index !== dateIndex);
      setSelectedDates(newDates);

      if (dateToCheck.getTime() === startDate?.getTime()) {
        setStartDate(null);
        setEndDate(null);
      }
      if (dateToCheck.getTime() === endDate?.getTime()) {
        setEndDate(null);
      }
    } else {
      const newDates = [...selectedDates, dateToCheck].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      setSelectedDates(newDates);

      // Allow single date selection (one night booking)
      if (newDates.length === 1) {
        setStartDate(dateToCheck);
        // For single date booking, end date should be same as start date (one night)
        // The actual checkout will be the next day, but the booking is for one night
        setEndDate(new Date(dateToCheck.getTime() + 86400000));
      } else {
        const firstDate = newDates[0];
        const lastDate = newDates[newDates.length - 1];
        setStartDate(firstDate);
        setEndDate(new Date(lastDate.getTime() + 86400000));
      }
    }
  };

  const getDateClusters = (dates: Date[]): Date[][] => {
    if (dates.length === 0) return [];

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const clusters: Date[][] = [];
    let currentCluster: Date[] = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];

      const timeDiff = currentDate.getTime() - previousDate.getTime();
      const isConsecutive = timeDiff === 86400000; 

      if (isConsecutive) {
        currentCluster.push(currentDate);
      } else {
        clusters.push([...currentCluster]);
        currentCluster = [currentDate];
      }
    }

    clusters.push(currentCluster);
    return clusters;
  };

  const calculateTotalNights = (clusters: Date[][]): number => {
    return clusters.reduce((total, cluster) => total + cluster.length, 0);
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const convertClustersToDateArrays = (
    clusters: Date[][],
  ): { startDates: string[]; endDates: string[] } => {
    const startDates: string[] = [];
    const endDates: string[] = [];

    clusters.forEach((cluster) => {
      if (cluster.length > 0) {
        // For single date booking, start date is the selected date
        startDates.push(cluster[0].toISOString().split("T")[0]);

        const endDate = new Date(cluster[cluster.length - 1]);
        endDate.setDate(endDate.getDate() + 1); // Add one day for checkout
        endDates.push(endDate.toISOString().split("T")[0]);
      }
    });

    return { startDates, endDates };
  };

  const renderDayContents = (day: number, date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const isBooked = isDateBooked(normalizedDate);
    const isSelected = isDateSelected(normalizedDate);
    const isToday =
      new Date().setHours(0, 0, 0, 0) === normalizedDate.getTime();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = normalizedDate < today;

    const handleDateClick = () => {
      if (!isBooked && !isPast) {
        handleDateChange(normalizedDate);
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
          !isBooked && !isPast && setHoveredDate(normalizedDate)
        }
        onMouseLeave={() => setHoveredDate(null)}
        title={
          isBooked
            ? "Already booked"
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

    // Check if at least one date is selected
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // For single date booking, ensure we have a start date
    if (!startDate) {
      toast.error("Please select a start date", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // For single date booking, ensure we have an end date
    if (!endDate) {
      // If no end date is set, set it to startDate + 1 day
      setEndDate(new Date(startDate.getTime() + 86400000));
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

      const dateClusters = getDateClusters(selectedDates);
      const totalNights = calculateTotalNights(dateClusters);
      const totalAmount = property.price * totalNights;

      const { startDates, endDates } =
        convertClustersToDateArrays(dateClusters);

      console.log("📅 Date clusters for backend:", {
        startDates,
        endDates,
        clusters: dateClusters.map((cluster) =>
          cluster.map((d) => d.toISOString().split("T")[0]),
        ),
      });

      const offlineBookingData = {
        apartmentId: property.id,
        startDate: startDates,
        endDate: endDates,
        name: bookingData.name,
        email: bookingData.email,
      };

      const result = await offlineBooking(offlineBookingData);

      toast.success("Booking created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      const bookingInfo = {
        ...bookingData,
        propertyId: property.id,
        propertyName: property.name,
        selectedDates: selectedDates,
        dateClusters: dateClusters,
        startDate: startDate,
        endDate: endDate,
        totalNights: totalNights,
        totalPrice: totalAmount,
      };

      onSubmit(bookingInfo);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      toast.error(`Booking failed: ${error.message || "Please try again"}`, {
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
    setStartDate(null);
    setEndDate(null);
    setBookedDates([]);
    setHoveredDate(null);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const dateClusters = getDateClusters(selectedDates);
  const totalNights = calculateTotalNights(dateClusters);
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

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="tel"
                    required
                    value={bookingData.phone}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone Number"
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
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    renderDayContents={renderDayContents}
                    filterDate={(date) => !isDateBooked(date)}
                    dayClassName={(date) => {
                      if (isDateBooked(date)) {
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
                    <span className="font-semibold text-gray-900">
                      Booking Summary:
                    </span>
                    <span className="text-blue-600 font-medium">
                      {totalNights} night{totalNights > 1 ? "s" : ""} total
                    </span>
                  </div>

                  <div className="space-y-4 mb-4">
                    {dateClusters.map((cluster, clusterIndex) => (
                      <div
                        key={clusterIndex}
                        className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-700">
                            Booking {clusterIndex + 1}
                          </span>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {cluster.length} night
                            {cluster.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-in:</span>
                            <span>{formatDisplayDate(cluster[0])} (1pm)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out:</span>
                            <span>
                              {formatDisplayDate(
                                new Date(
                                  cluster[cluster.length - 1].getTime() +
                                    86400000,
                                ),
                              )}{" "}
                              (12noon)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nights:</span>
                            <span>{cluster.length}</span>
                          </div>
                          {property.price && (
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(property.price * cluster.length)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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

                      {dateClusters.length > 1 && (
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-gray-600">
                            Individual bookings:
                          </span>
                          <span className="text-gray-900 text-right">
                            {dateClusters.map((cluster, index) => (
                              <div key={index} className="text-right">
                                Booking {index + 1}:{" "}
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(property.price * cluster.length)}
                              </div>
                            ))}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Amount:</span>
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
                  "Confirm Booking"
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

                  <div className="flex flex-wrap gap-1">
                    {property.amenities &&
                      property.amenities.slice(0, 2).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    {property.amenities && property.amenities.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{property.amenities.length - 2} more
                      </span>
                    )}
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