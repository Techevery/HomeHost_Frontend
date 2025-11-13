// components/BannerForm.tsx
import React, { useState, useEffect } from "react";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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
    error,
    clearError,
    isAuthenticated,
    checkAuth,
  } = useBannerStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication when form opens
    const authValid = checkAuth();
    if (!authValid) {
      setFormError("Your session has expired. Please log in again.");
      return;
    }

    if (bannerId) {
      fetchBannerById(bannerId);
    }
  }, [bannerId, fetchBannerById, checkAuth]);

  useEffect(() => {
    if (currentBanner && bannerId) {
      setFormData({
        name: currentBanner.name || "",
        description: currentBanner.description || "",
      });

      // Set existing image as preview
      if (currentBanner.image_url) {
        setImagePreviews([currentBanner.image_url]);
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

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (formError) {
      setFormError(null);
      clearError();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Process only the first image (backend expects single image)
    if (files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image size should be less than 5MB");
        return;
      }

      newImages.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews([reader.result as string]);
      };
      reader.readAsDataURL(file);
    }

    setImages(newImages);
    setFormError(null);
    clearError();
  };

  const removeImage = () => {
    setImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Check authentication
    if (!isAuthenticated) {
      setFormError("Your session has expired. Please log in again.");
      return;
    }

    // Validate form
    if (!formData.name.trim()) {
      setFormError("Name is required");
      return;
    }

    if (!bannerId && images.length === 0) {
      setFormError("Image is required for new banners");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());

    // Append image (single image as per backend)
    if (images.length > 0) {
      data.append("image", images[0]);
    }

    try {
      if (bannerId) {
        await updateBanner(bannerId, data);
      } else {
        await createBanner(data);
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the store
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    clearError();
    setFormError(null);
    onClose();
  };

  // Show auth error message
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Required
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Session Expired</h3>
                <p className="text-yellow-700 mt-1">
                  Your session has expired. Please log in again to continue.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {bannerId ? "Edit Banner" : "Create New Banner"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Display */}
          {(formError || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{formError || error}</span>
            </div>
          )}

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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter banner name"
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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter banner description"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1">
              Image {!bannerId && "*"}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required={!bannerId && images.length === 0}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, WebP. Max size: 5MB.{" "}
              {bannerId && "Leave empty to keep current image."}
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Image Preview:
                </p>
                <div className="relative inline-block">
                  <img
                    src={imagePreviews[0]}
                    alt="Preview"
                    className="w-full max-w-xs h-32 object-cover rounded-md border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isLoading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 disabled:opacity-50 flex items-center">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {bannerId ? "Updating..." : "Creating..."}
                </>
              ) : (
                bannerId ? "Update Banner" : "Create Banner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;