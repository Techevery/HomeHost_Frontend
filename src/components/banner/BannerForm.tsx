// components/BannerForm.tsx
import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useBannerStore from "../../stores/bannerStore";

interface BannerFormProps {
  bannerId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({
  bannerId,
  onClose,
  onSuccess,
}) => {
  const {
    currentBanner,
    fetchBannerById,
    createBanner,
    updateBanner,
    isLoading,
  } = useBannerStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (bannerId) {
      fetchBannerById(bannerId);
    }
  }, [bannerId, fetchBannerById]);

  useEffect(() => {
    if (currentBanner && bannerId) {
      setFormData({
        name: currentBanner.name || "",
        description: currentBanner.description || "",
      });

      // Set existing images as previews
      if (currentBanner.images && currentBanner.images.length > 0) {
        setImagePreviews(currentBanner.images);
      }
    } else {
      // Reset form for new banner
      setFormData({
        name: "",
        description: "",
      });
      setImages([]);
      setImagePreviews([]);
    }
  }, [currentBanner, bannerId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Process up to 2 images (as per your backend configuration)
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      const file = files[i];
      newImages.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        // Update previews when all images are processed
        if (newPreviews.length === Math.min(files.length, 2)) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);

    // Append images (up to 2 as per backend configuration)
    images.forEach((image, index) => {
      data.append("image", image);
    });

    try {
      if (bannerId) {
        await updateBanner(bannerId, data);
      } else {
        await createBanner(data);
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the store
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {bannerId ? "Edit Banner" : "Create New Banner"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="images"
              className="block text-sm font-medium text-gray-700 mb-1">
              Images {!bannerId && "*"}
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              required={!bannerId && images.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can upload up to 2 images.{" "}
              {bannerId && "Leave empty to keep current images."}
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Image Previews:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
              {isLoading
                ? "Saving..."
                : bannerId
                ? "Update Banner"
                : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;
