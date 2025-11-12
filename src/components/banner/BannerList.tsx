// components/BannerList.tsx
import React, { useEffect, useState } from "react";
import useBannerStore from "../../stores/bannerStore";
import BannerCard from "./BannerCard";
import BannerForm from "./BannerForm";
import { PlusIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const BannerList: React.FC = () => {
  const { 
    banners, 
    fetchBanners, 
    isLoading, 
    error, 
    clearError, 
    isAuthenticated,
    checkAuth 
  } = useBannerStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check authentication on component mount
    checkAuth();
    
    const loadBanners = async () => {
      try {
        await fetchBanners();
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners, retryCount, checkAuth]);

  const handleEdit = (id: string) => {
    if (!isAuthenticated) {
      // Redirect to login or show auth message
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setEditingBanner(id);
    setIsFormOpen(true);
  };

  const handleAddBanner = () => {
    if (!isAuthenticated) {
      // Redirect to login or show auth message
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setIsFormOpen(true);
    setEditingBanner(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
    clearError();
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    // Refresh the banners list to show updated data
    fetchBanners();
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    clearError();
  };

  // Show authentication required message
  if (!isAuthenticated && error?.includes('Authentication required')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
              <p className="text-yellow-700 mt-1">
                You need to be logged in to manage banners.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Log In
            </button>
            <button
              onClick={clearError}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && banners.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (error && banners.length === 0 && !error.includes('Authentication required')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Failed to load banners</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={clearError}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Banner Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your website banners and promotions
            {!isAuthenticated && (
              <span className="text-yellow-600 text-sm ml-2">
                (Read-only mode - Login to edit)
              </span>
            )}
          </p>
        </div>
        
        {isAuthenticated ? (
          <button
            onClick={handleAddBanner}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-fit">
            <PlusIcon className="h-5 w-5" />
            <span>Add New Banner</span>
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 w-fit">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Log In to Manage</span>
          </button>
        )}
      </div>

      {/* Error Banner for non-critical errors */}
      {error && banners.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {isFormOpen && isAuthenticated && (
        <BannerForm
          bannerId={editingBanner}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {banners.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No banners yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {isAuthenticated 
              ? "Get started by creating your first banner to showcase promotions, announcements, or featured content on your website."
              : "There are no banners to display. Log in to create and manage banners."
            }
          </p>
          {isAuthenticated && (
            <button
              onClick={handleAddBanner}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Create Your First Banner
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <BannerCard 
              key={banner.id} 
              banner={banner} 
              onEdit={handleEdit}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Loading overlay for background operations */}
      {isLoading && banners.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-700">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;