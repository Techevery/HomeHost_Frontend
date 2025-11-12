// components/BannerCard.tsx
import React, { useState } from "react";
import { PencilIcon, TrashIcon, XMarkIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import useBannerStore from "../../stores/bannerStore";

interface BannerCardProps {
  banner: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    status?: "active" | "inactive";
    created_at: string;
    updated_at: string;
  };
  onEdit: (id: string) => void;
  isAuthenticated?: boolean;
}

const BannerCard: React.FC<BannerCardProps> = ({ banner, onEdit, isAuthenticated = false }) => {
  const { deleteBanner, isLoading } = useBannerStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleEditClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    onEdit(banner.id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBanner(banner.id);
      setShowDeleteModal(false);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getDisplayImage = (): string | null => {
    return banner.image_url || null;
  };

  // Handle image loading errors
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMzUgMTQwSDE2NUwxMDAgNzVaIiBmaWxsPSIjRURFRUVGIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iI0VERUVFRiIvPgo8dGV4dCB4PSI1MCIgeT0iOTAiIGZpbGw9IiM5QTlBOUEiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXJyb3IgTG9hZGluZzwvdGV4dD4KPC9zdmc+Cg==";
  };

  // Handle image load success
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Image loaded successfully
    console.log('Image loaded successfully');
  };

  // Get status with default value
  const getStatus = (): "active" | "inactive" => {
    return banner.status || "active";
  };

  // Get status display text
  const getStatusText = (): string => {
    const status = getStatus();
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status styling
  const getStatusStyles = (): string => {
    const status = getStatus();
    return status === "active"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Get the display image
  const displayImage = getDisplayImage();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 relative">
        {/* Auth overlay for non-authenticated users */}
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 z-10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <LockClosedIcon className="h-4 w-4" />
              <span className="text-sm">Log in to manage</span>
            </div>
          </div>
        )}

        <div className="relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={banner.name}
              className="w-full h-48 object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {banner.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
            {banner.description || "No description provided"}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className={`px-2 py-1 rounded ${displayImage ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
        
            </span>
            <span className="text-xs">
              Created: {new Date(banner.created_at).toLocaleDateString()}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex space-x-2">
              <button
                onClick={handleEditClick}
                disabled={isLoading}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <p className="text-gray-600 text-sm flex items-center justify-center">
                <LockClosedIcon className="h-4 w-4 mr-1" />
                Log in to manage this banner
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Banner
              </h3>
              <button
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the banner{" "}
                <strong className="text-gray-900">"{banner.name}"</strong>? This action cannot be undone.
              </p>

              {displayImage && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={displayImage}
                    alt={banner.name}
                    className="w-full h-32 object-cover rounded-md"
                    onError={handleImageError}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 disabled:opacity-50 flex items-center">
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
                      Deleting...
                    </>
                  ) : (
                    "Delete Banner"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BannerCard;