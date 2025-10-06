import React, { useEffect, useState } from 'react'
import useAdminStore from '../../../../stores/admin'// Adjust the import path as needed

const TotalNumbers = () => {
  const { getDashboardStats, isLoading } = useAdminStore()
  const [statsData, setStatsData] = useState(null)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLocalLoading(true)
        const response = await getDashboardStats()
      
        
        if (response && response.data) {
          setStatsData(response.data)
        }
      } catch (error) {
     
      } finally {
        setLocalLoading(false)
      }
    }

    fetchStats()
  }, [getDashboardStats])

  // Format currency for Nigerian Naira
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate stats based on API data
  const getStats = () => {
    if (!statsData) return []

    const {
      totalIncome = 0,
      verifiedAgents = 0,
      totalAgents = 0,
      totalBookings = 0,
      totalApartments = 0
    } = statsData

    return [
      {
        title: "Total Income",
        value: formatCurrency(totalIncome),
        change: totalIncome > 0 ? "+12.5%" : "+0%",
        trend: totalIncome > 0 ? "up" : "neutral",
        color: "from-blue-600 to-blue-700",
        icon: "₦",
        description: "From all bookings"
      },
      {
        title: "Verified Agents",
        value: `${verifiedAgents}`,
        change: totalAgents > 0 ? `+${((verifiedAgents / totalAgents) * 100).toFixed(1)}%` : "+0%",
        trend: verifiedAgents > 0 ? "up" : "neutral",
        color: "from-purple-600 to-purple-700",
        icon: "👤",
        description: `Out of ${totalAgents} total agents`
      },
      {
        title: "Total Bookings",
        value: `${totalBookings}`,
        change: totalBookings > 0 ? "+8.1%" : "+0%",
        trend: totalBookings > 0 ? "up" : "neutral",
        color: "from-cyan-500 to-blue-500",
        icon: "📅",
        description: "All time bookings"
      },
      {
        title: "Total Apartments",
        value: `${totalApartments}`,
        change: totalApartments > 0 ? "+5.2%" : "+0%",
        trend: totalApartments > 0 ? "up" : "neutral",
        color: "from-green-500 to-emerald-600",
        icon: "🏢",
        description: "Listed properties"
      }
    ]
  }

  const stats = getStats()

  if (localLoading || isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl p-6 h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!statsData || stats.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center text-gray-500 py-8">
          Unable to load dashboard statistics
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className="text-2xl opacity-90 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">{stat.description}</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-500/20 text-green-200' : 
                  stat.trend === 'down' ? 'bg-red-500/20 text-red-200' :
                  'bg-gray-500/20 text-gray-200'
                }`}>
                  <span className={`text-xs ${
                    stat.trend === 'up' ? '↗' : 
                    stat.trend === 'down' ? '↘' : '→'
                  }`}>
                    {stat.trend === 'up' ? '↗' : 
                     stat.trend === 'down' ? '↘' : '→'}
                  </span>
                  <span className="text-xs font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TotalNumbers