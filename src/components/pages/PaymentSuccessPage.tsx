import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAgentStore from "../../stores/agentstore"; 

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalUrl: urlParam } = useParams(); 
  const { agentInfo } = useAgentStore();
  

  const personalUrl = location.state?.personalUrl || 
                     (urlParam ? `/shortlet/${urlParam}` : null) || 
                     (agentInfo?.slug ? `/shortlet/${agentInfo.slug}` : null);

  const handleBackToProperties = () => {
    if (personalUrl) {
      navigate(personalUrl);
    } else {
      // Fallback to home if no personal URL provided
      navigate("/");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
     
        <div className="mb-8 flex justify-center">
          <NavLink to="/">
            <img
              src="/logo.svg"
              alt="HomeyHost Logo"
              className="h-10"
              onError={(e) => {
                // Fallback if logo doesn't load
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-lg">H</span>';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
            <p className=" text-2xl ">
 HomeyHost
            </p>
           
          </NavLink>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-2">
            Thank you for your payment. Your booking has been confirmed and your payment has been processed successfully.
          </p>
        
        </div>

      

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBackToProperties}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {personalUrl ? "Back to Properties" : "Back to Home"}
          </button>
          
          
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@homeyhost.ng" className="text-blue-600 hover:underline">
              support@homeyhost.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;