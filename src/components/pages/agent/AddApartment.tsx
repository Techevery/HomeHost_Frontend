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
  const { createProperty, loading: storeLoading } = usePropertyStore();
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.some((file) => file.size > 1024 * 1024 * 5)) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, images: files }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((image) => submitData.append("images", image));
        } else if (key === "amenities") {
          // Convert amenities array to string or handle appropriately
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value as string);
        }
      });

      // Add location if not already included
      if (!formData.location && formData.address) {
        submitData.append("location", formData.address);
      }

      await createProperty(submitData);
      
      setModalMessage("Property created successfully!");
      setModalOpen(true);
      
      // Navigate after successful creation
      setTimeout(() => {
        navigate("/list-of-apartment");
      }, 1500);
      
    } catch (error: any) {
      setModalMessage(error.message || "Failed to create property");
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="relative font-inter min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowBackIcon /> 
        </Button>
        <h1 className="text-3xl font-bold text-center mb-6">Add New Property</h1>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Property Name" value={formData.name} onChange={handleInputChange} required />
              <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
              <Input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
              
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flat">Flat</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>
              
              <Textarea name="servicing" placeholder="Services (e.g., Free WiFi, Netflix)" value={formData.servicing} onChange={handleInputChange} required />
              <Textarea name="amenities" placeholder="Amenities (comma-separated)" value={formData.amenities.join(", ")} onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value.split(",").map(item => item.trim()) }))} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input name="bedroom" type="number" placeholder="Bedrooms" value={formData.bedroom} onChange={handleInputChange} required />
                <Input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
              </div>
              
              <Input type="file" accept="image/*" multiple onChange={handleImageChange} required />
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={storeLoading}>
                  {storeLoading ? <CircularProgress size={24} /> : "Create Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2" className="mb-4">
            {modalMessage}
          </Typography>
          <Button onClick={handleCloseModal}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default AddApartment;