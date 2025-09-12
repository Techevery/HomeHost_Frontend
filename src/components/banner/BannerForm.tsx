// components/BannerForm.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useBannerStore from '../../stores/bannerStore';

interface BannerFormProps {
  bannerId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ bannerId, onClose, onSuccess }) => {
  const { banners, currentBanner, fetchBannerById, createBanner, updateBanner, loading } = useBannerStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,

  });

  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (bannerId) {
      fetchBannerById(bannerId);
    }
  }, [bannerId, fetchBannerById]);

  useEffect(() => {
    if (currentBanner && bannerId) {
      setFormData({
        title: currentBanner.title,
        description: currentBanner.description,
        image: null,
  
      });
      setImagePreview(currentBanner.imageUrl);
    } else {
      // Set order to max order + 1 for new banners
      const maxOrder = Math.max(...banners.map(b => b.order), 0);
      setFormData(prev => ({
        ...prev,
        order: maxOrder + 1
      }));
    }
  }, [currentBanner, bannerId, banners]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
   
    
    if (formData.image) {
      data.append('image', formData.image);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {bannerId ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image {!bannerId && '*'}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required={!bannerId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

         
          <div className="grid grid-cols-2 gap-4">
          

           
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : bannerId ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;