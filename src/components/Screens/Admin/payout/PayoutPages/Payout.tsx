import React, { useState, useEffect } from 'react'
import PayoutTable from './PayoutTable'
import useWalletStore from '../../../../../stores/payoutStore';
import { 
  MdAccountBalanceWallet,
  MdPendingActions,
  MdPeople,
  MdTrendingUp,
  MdRefresh
} from 'react-icons/md';

const Payout = () => {
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

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
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
      <div className="space-y-6">
        {/* Loading Skeleton for Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-300 rounded-[12px] p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-400 rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-gray-400 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-400 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        <PayoutTable />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-4">
          <div className="flex justify-between items-center">
            <div className="text-red-700 text-sm">
              Error loading statistics: {error}
            </div>
            <button
              onClick={fetchStatistics}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <MdRefresh className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Payout Processed */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20">
            <MdAccountBalanceWallet className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-black text-sm font-medium mb-2">Total Payout Processed</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {formatCurrency(stats.totalPayout)}
              </h2>
              <div className="flex items-center">
                <span className={`text-black/90 text-sm font-medium px-2 py-1 rounded ${
                  percentageChanges.totalPayout >= 0 ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}>
                  {percentageChanges.totalPayout >= 0 ? '+' : ''}{percentageChanges.totalPayout.toFixed(1)}%
                </span>
                <span className="text-black/80 text-sm ml-2">All time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20">
            <MdPendingActions className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-black text-sm font-medium mb-2">Pending Approvals</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {formatCurrency(stats.totalPendingPayout)}
              </h2>
              <div className="flex items-center">
                <span className="bg-blue-500/30 text-black/90 text-sm font-medium px-2 py-1 rounded">
                  {stats.totalPendingPayout > 0 ? 'Pending' : 'Clear'}
                </span>
                <span className="text-black/80 text-sm ml-2">Awaiting review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20">
            <MdPeople className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-black text-sm font-medium mb-2">Verified Agents</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {formatNumber(stats.totalVerifiedAgents)}
              </h2>
              <div className="flex items-center">
                <span className={`text-black/90 text-sm font-medium px-2 py-1 rounded ${
                  percentageChanges.verifiedAgents >= 0 ? 'bg-purple-500/30' : 'bg-red-500/30'
                }`}>
                  {percentageChanges.verifiedAgents >= 0 ? '+' : ''}{percentageChanges.verifiedAgents.toFixed(1)}%
                </span>
                <span className="text-black/80 text-sm ml-2">Active agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20">
            <MdTrendingUp className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-black text-sm font-medium mb-2">Platform Revenue</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {formatCurrency(stats.totalRevenue)}
              </h2>
              <div className="flex items-center">
                <span className={`text-black/90 text-sm font-medium px-2 py-1 rounded ${
                  percentageChanges.platformRevenue >= 0 ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}>
                  {percentageChanges.platformRevenue >= 0 ? '+' : ''}{percentageChanges.platformRevenue.toFixed(1)}%
                </span>
                <span className="text-black/80 text-sm ml-2">Total revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        {/* <button
          onClick={fetchStatistics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#4977E7] text-white rounded-lg hover:bg-[#3B67D1] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <MdRefresh className="w-4 h-4" />
          {isLoading ? 'Refreshing...' : 'Refresh Statistics'}
        </button> */}
      </div>

      {/* Payout Table */}
      <PayoutTable />
    </div>
  )
}

export default Payout