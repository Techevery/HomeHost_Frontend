import React from 'react'
import PayoutTable from './PayoutTable'

const Payout = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Payout Processed */}
        <div className="bg-[#4EC368] rounded-[12px] p-6 shadow-sm">
          <h3 className="text-white text-sm font-medium mb-2">Total Payout processed</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">N2,450,000</h2>
              <div className="flex items-center mt-1">
                <span className="text-white/90 text-sm font-medium">+12.5%</span>
                <span className="text-white/80 text-sm ml-1">This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#4977E7] rounded-[12px] p-6 shadow-sm">
          <h3 className="text-white text-sm font-medium mb-2">Pending Approvals</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">N2,450,000</h2>
              <div className="flex items-center mt-1">
                <span className="text-white/90 text-sm font-medium">$ Pending</span>
                <span className="text-white/80 text-sm ml-1">Awaiting review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-[#9E71CE] rounded-[12px] p-6 shadow-sm">
          <h3 className="text-white text-sm font-medium mb-2">Active Agents</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">48</h2>
              <div className="flex items-center mt-1">
                <span className="text-white/80 text-sm">Registered agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-[#86D1B3] rounded-[12px] p-6 shadow-sm">
          <h3 className="text-white text-sm font-medium mb-2">Platform Revenue</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-3xl font-bold text-white">000</span>
                <span className="text-3xl text-white/80 font-normal">&</span>
                <span className="text-3xl font-bold text-white">N85,400</span>
              </div>
              <div className="flex items-center">
                <span className="text-white/90 text-sm font-medium">+18.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <PayoutTable />
    </div>
  )
}

export default Payout