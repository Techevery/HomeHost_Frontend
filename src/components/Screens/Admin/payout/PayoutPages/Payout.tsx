import React from 'react'
import PayoutTable from './PayoutTable'

const Payout = () => {


  return (
    <div>
          <div className='bg-white rounded-[20px] px-4 py-4'>
<div className='grid lg:gap-20 md:gap-14 gap-10 grid-cols-2 md:grid-cols-3'>
<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#4977E7]'>
<h5 className='text-[15px] '>Total Payout</h5>
<h3 className='text-[20px] font-bold'>NGN 2,000,000</h3>
</div>


<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#9E71CE]'>
<h5 className='text-[15px] '>Pending Payout</h5>
<h3 className='text-[20px] font-bold'>NGN 400,000</h3>
</div>




<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#86D1B3]'>
<h5 className='text-[15px] '>Profit</h5>
<h3 className='text-[20px] font-bold'>NGN 2,000,000</h3>
</div>
</div>
        </div>

<PayoutTable />
    </div>
  )
}

export default Payout