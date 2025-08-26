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

interface FormData {
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: File[];
}

const AddApartment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    type: "",
    servicing: "",
    bedroom: "",
    price: "",
    images: [],
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
    setLoading(true);

    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      toast.error("Admin token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((image) => submitData.append("images", image));
        } else {
          submitData.append(key, value as string);
        }
      });

      const response = await fetch("https://homey-host.onrender.com/api/v1/admin/upload-property", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: submitData,
      });

      const result = await response.json();
      if (result.status === "success") {
        setModalMessage(result.message);
        setModalOpen(true);
        navigate("/list-of-apartment");
        return;
        
      } else {
        setModalMessage(result.message || "Failed to create apartment");
        setModalOpen(true);
      }
    } catch (error) {
      setModalMessage("An error occurred while creating the apartment");
      setModalOpen(true);
      console.error(error);
    } finally {
      setLoading(false);
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
              <div className="grid grid-cols-2 gap-4">
                <Input name="bedroom" type="number" placeholder="Bedrooms" value={formData.bedroom} onChange={handleInputChange} required />
                <Input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <Input type="file" accept="image/*" multiple onChange={handleImageChange} required />
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Create Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            {modalMessage}
          </Typography>
          <Button onClick={handleCloseModal}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default AddApartment;
