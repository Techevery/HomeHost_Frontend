
import React from "react";
import PayoutRequestTable from "./PayoutRequestTable";

const PayoutRequest = () => {
  return (
    <div>
      <div className="bg-white rounded-[20px] px-6 py-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Payout */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Total Payout processed</h5>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                +12.5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">N2,450,000</h3>
            <p className="text-sm text-gray-500">This month</p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Pending Approvals</h5>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                5 pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">N2,450,000</h3>
            <p className="text-sm text-gray-500">Awaiting review</p>
          </div>

          {/* Active Agents */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <h5 className="text-[15px] text-gray-600 font-medium mb-4">Active Agents</h5>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">48</h3>
            <p className="text-sm text-gray-500">Registered agents</p>
          </div>

          {/* Platform Revenue */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Platform Revenue</h5>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                +18.24%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">N85,400</h3>
            <p className="text-sm text-gray-500">This month</p>
          </div>
        </div>

        
      </div>

      <PayoutRequestTable />
    </div>
  );
};

export default PayoutRequest;