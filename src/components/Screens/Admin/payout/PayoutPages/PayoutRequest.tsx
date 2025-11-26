import React, { useState, useEffect } from "react";
import PayoutRequestTable from "./PayoutRequestTable";
import useWalletStore from '../../../../../stores/payoutStore';
import { 
  MdAttachMoney, 
  MdPendingActions, 
  MdPeople, 
  MdTrendingUp,
  MdAccountBalanceWallet 
} from 'react-icons/md';

const PayoutRequest = () => {
  const [stats, setStats] = useState({
    totalPayout: 0,
    totalPendingPayout: 0,
    totalVerifiedAgents: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getPayoutStatistics } = useWalletStore();

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statistics = await getPayoutStatistics();
      setStats({
        totalPayout: statistics.totalPayout || 0,
        totalPendingPayout: statistics.totalPendingPayout || 0,
        totalVerifiedAgents: statistics.totalVerifiedAgents || 0,
        totalRevenue: statistics.totalRevenue || 0
      });
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
      console.error("Error fetching statistics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage changes (you can replace with real data if available)
  const getPercentageChange = (current: number, previous: number = current * 0.8) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const percentageChanges = {
    totalPayout: getPercentageChange(stats.totalPayout),
    totalPending: 0, // Static for pending count
    verifiedAgents: getPercentageChange(stats.totalVerifiedAgents, Math.max(stats.totalVerifiedAgents - 5, 1)),
    platformRevenue: getPercentageChange(stats.totalRevenue)
  };

  if (isLoading) {
    return (
      <div>
        <div className="bg-white rounded-[20px] px-6 py-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-100 rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        <PayoutRequestTable />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-white rounded-[20px] px-6 py-6 mb-6">
          <div className="text-center p-8">
            <div className="text-red-600 mb-4">Error loading statistics: {error}</div>
            <button 
              onClick={fetchStatistics}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <PayoutRequestTable />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-[20px] px-6 py-6 mb-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm">{error}</div>
            <button 
              onClick={fetchStatistics}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Payout */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <MdAccountBalanceWallet className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Total Payout Processed</h5>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                percentageChanges.totalPayout >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {percentageChanges.totalPayout >= 0 ? '+' : ''}{percentageChanges.totalPayout.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(stats.totalPayout)}
            </h3>
            <p className="text-sm text-gray-500">All time processed</p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <MdPendingActions className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Pending Approvals</h5>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                {stats.totalPendingPayout > 0 ? 'Pending' : 'Clear'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(stats.totalPendingPayout)}
            </h3>
            <p className="text-sm text-gray-500">Awaiting review</p>
          </div>

          {/* Verified Agents */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <MdPeople className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Verified Agents</h5>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                percentageChanges.verifiedAgents >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {percentageChanges.verifiedAgents >= 0 ? '+' : ''}{percentageChanges.verifiedAgents.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {stats.totalVerifiedAgents}
            </h3>
            <p className="text-sm text-gray-500">Active agents</p>
          </div>

          {/* Platform Revenue */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <MdTrendingUp className="w-8 h-8 text-green-600 opacity-20" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-[15px] text-gray-600 font-medium">Platform Revenue</h5>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                percentageChanges.platformRevenue >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {percentageChanges.platformRevenue >= 0 ? '+' : ''}{percentageChanges.platformRevenue.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-sm text-gray-500">Total revenue</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mt-6">
          {/* <button
            onClick={fetchStatistics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <MdAttachMoney className="w-4 h-4" />
            {isLoading ? 'Refreshing...' : 'Refresh Statistics'}
          </button> */}
        </div>
      </div>

      <PayoutRequestTable />
    </div>
  );
};

export default PayoutRequest;