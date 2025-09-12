// components/BannerList.tsx
import React, { useEffect, useState } from 'react';
import useBannerStore from '../../stores/bannerStore';
import BannerCard from './BannerCard';
import BannerForm from './BannerForm';
import { PlusIcon } from '@heroicons/react/24/outline';

const BannerList: React.FC = () => {
  const { banners, fetchBanners, loading, error, clearError } = useBannerStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleEdit = (id: string) => {
    setEditingBanner(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button onClick={clearError} className="absolute top-0 right-0 p-4">
          <span className="text-2xl">&times;</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Banner</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Banner</span>
        </button>
      </div>

      {isFormOpen && (
        <BannerForm
          bannerId={editingBanner}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      {banners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first banner.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerList;