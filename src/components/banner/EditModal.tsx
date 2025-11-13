// components/EditModal.tsx
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
//   onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
//   onConfirm,
  title,
  message,
  isLoading = false,
//   confirmText = "Continue",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50">
              {cancelText}
            </button>
            {/* <button
            //   onClick={onConfirm}
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
                  Loading...
                </>
              ) : (
                l
              )}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;