import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../UI/Card";
import { Input } from "../../UI/Input";
import { Button } from "../../UI/Bottons";
import { Textarea } from "../../UI/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../UI/Select";
import { CircularProgress, Modal, Box, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import usePropertyStore from "../../../stores/propertyStore";

interface FormData {
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: File[];
  location: string;
  amenities: string[];
}

const AddApartment: React.FC = () => {
  const navigate = useNavigate();
  const { createProperty, loading } = usePropertyStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    type: "",
    servicing: "",
    bedroom: "",
    price: "",
    images: [],
    location: "",
    amenities: [],
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file sizes
      const oversizedFiles = files.filter(file => file.size > 1024 * 1024 * 5);
      if (oversizedFiles.length > 0) {
        toast.error("One or more images exceed the 5MB size limit");
        return;
      }

      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        toast.error("Please select only image files (JPG, PNG, etc.)");
        return;
      }

      setFormData((prev) => ({ ...prev, images: files }));
    }
  };

  const validateForm = (): boolean => {
    const { name, address, type, servicing, bedroom, price, images, location } = formData;
    
    if (!name.trim() || !address.trim() || !location.trim()) {
      setModalMessage("Please fill in all required fields");
      setModalType("error");
      return false;
    }

    if (!type) {
      setModalMessage("Please select a property type");
      setModalType("error");
      return false;
    }

    if (!servicing.trim()) {
      setModalMessage("Please provide service information");
      setModalType("error");
      return false;
    }

    if (!bedroom || parseInt(bedroom) <= 0) {
      setModalMessage("Please enter a valid number of bedrooms");
      setModalType("error");
      return false;
    }

    if (!price || parseFloat(price) <= 0) {
      setModalMessage("Please enter a valid price");
      setModalType("error");
      return false;
    }

    if (images.length === 0) {
      setModalMessage("Please upload at least one image");
      setModalType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setModalOpen(true);
      return;
    }
    
    try {
      const submitData = new FormData();
      
      // Append form data systematically
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((image) => submitData.append("images", image));
        } else if (key === "amenities") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value as string);
        }
      });

      // Ensure location is included
      if (!formData.location && formData.address) {
        submitData.append("location", formData.address);
      }

      await createProperty(submitData);
      
      setModalMessage("Property created successfully!");
      setModalType("success");
      setModalOpen(true);
      
      // Navigate after successful creation
      setTimeout(() => {
        navigate("/list-of-apartment");
      }, 1500);
      
    } catch (error: any) {
      setModalMessage(error.message || "Failed to create property. Please try again.");
      setModalType("error");
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCancel = () => {
    if (formData.name || formData.address || formData.images.length > 0) {
      setModalMessage("You have unsaved changes. Are you sure you want to cancel?");
      setModalType("error");
      setModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors border-gray-300 hover:border-gray-400"
          >
            <ArrowBackIcon fontSize="small" />
            Back to Dashboard
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
          </div>
        </div>

        {/* Form Section */}
        <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                  <p className="text-gray-500 text-sm mt-1">Essential details about the property</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Property Name *</label>
                    <Input 
                      name="name" 
                      placeholder="e.g., Luxury Downtown Apartment" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location/Area *</label>
                    <Input 
                      name="location" 
                      placeholder="e.g., Manhattan, New York" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Address *</label>
                  <Input 
                    name="address" 
                    placeholder="Complete street address including city and zip code" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Property Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Specific features and amenities</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Property Type *</label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Services Included *</label>
                  <Textarea 
                    name="servicing" 
                    placeholder="List all services included (e.g., Free WiFi, Netflix, Weekly Cleaning, Utilities)" 
                    value={formData.servicing} 
                    onChange={handleInputChange} 
                    required 
                    className="min-h-[100px] resize-vertical"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amenities</label>
                  <Textarea 
                    name="amenities" 
                    placeholder="List amenities separated by commas (e.g., Swimming Pool, Gym, Parking, Security, Elevator)" 
                    value={formData.amenities.join(", ")} 
                    onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value.split(",").map(item => item.trim()) }))} 
                    className="min-h-[100px] resize-vertical"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Number of Bedrooms *</label>
                    <Input 
                      name="bedroom" 
                      type="number" 
                      placeholder="e.g., 2" 
                      value={formData.bedroom} 
                      onChange={handleInputChange} 
                      required 
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Monthly Price ($) *</label>
                    <Input 
                      name="price" 
                      type="number" 
                      placeholder="e.g., 2500" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                      required 
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Property Images</h2>
                  <p className="text-gray-500 text-sm mt-1">Upload high-quality photos of your property</p>
                </div>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <CloudUploadIcon className="text-gray-400 text-4xl mx-auto mb-4" />
                    <Input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange} 
                      required 
                      className="hidden" 
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium text-gray-700">Click to upload images</span>
                        <span className="text-sm text-gray-500 mt-1">
                          PNG, JPG, JPEG up to 5MB each
                        </span>
                        <Button type="button" variant="outline" className="mt-4">
                          Select Files
                        </Button>
                      </div>
                    </label>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Images ({formData.images.length})
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Ready to upload
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <ImageIcon className="text-gray-400 text-2xl" />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress size={20} className="text-white" />
                      <span>Creating Property...</span>
                    </div>
                  ) : (
                    "Create Property"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 400, 
          bgcolor: 'background.paper', 
          boxShadow: 24, 
          p: 4,
          borderRadius: 2,
          outline: 'none'
        }}>
          <div className={`text-center mb-4 ${modalType === "success" ? "text-green-600" : "text-red-600"}`}>
            {modalType === "success" ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✓</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">!</span>
              </div>
            )}
            <Typography 
              variant="h6" 
              component="h2" 
              className="font-semibold"
            >
              {modalType === "success" ? "Success!" : "Attention Needed"}
            </Typography>
          </div>
          <Typography className="text-gray-600 text-center mb-6">
            {modalMessage}
          </Typography>
          <div className="flex justify-center space-x-3">
            {modalType === "error" && modalMessage.includes("unsaved changes") && (
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-gray-300 text-gray-700"
              >
                Yes, Cancel
              </Button>
            )}
            <Button 
              onClick={handleCloseModal}
              className={`px-6 ${
                modalType === "success" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {modalType === "success" ? "Continue" : "Close"}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddApartment;