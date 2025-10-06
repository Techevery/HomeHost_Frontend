 // components/BannerCard.tsx
import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import useBannerStore from '../../stores/bannerStore';

interface BannerCardProps {
  banner: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    order: number;
    targetUrl: string;
  };
  onEdit: (id: string) => void;
}

const BannerCard: React.FC<BannerCardProps> = ({ banner, onEdit }) => {
  const { deleteBanner, loading } = useBannerStore();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await deleteBanner(banner.id);
    }
  };

  const handlePreview = () => {
    window.open(banner.imageUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="relative">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              banner.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {banner.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {banner.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {banner.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Order: {banner.order}</span>
          {banner.targetUrl && (
            <a
              href={banner.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate max-w-[120px]"
            >
              View Target
            </a>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(banner.id)}
            disabled={loading}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-md text-sm flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          
          <button
            onClick={handlePreview}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-md text-sm flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Preview
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-md text-sm flex items-center justify-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;