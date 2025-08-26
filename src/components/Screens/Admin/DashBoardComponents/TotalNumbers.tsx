import React from 'react'

const TotalNumbers = () => {
  return (
    <div>
        <div className='bg-white rounded-[20px] px-4 py-4'>
<div className='grid gap-10 grid-cols-2 md:grid-cols-4'>
<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#4977E7]'>
<h5 className='text-[15px] '>Total Income</h5>
<h3 className='text-[20px] font-bold'>NGN 2,000,000</h3>
</div>


<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#9E71CE]'>
<h5 className='text-[15px] '>No of Verify Agent</h5>
<h3 className='text-[20px] font-bold'>23</h3>
</div>


<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#7CC5FA]'>
<h5 className='text-[15px] '>No of Bookings</h5>
<h3 className='text-[20px] font-bold'>40</h3>
</div>


<div className='text-center text-white leading-[22px] py-6 rounded-[12px] bg-[#86D1B3]'>
<h5 className='text-[15px] '>No of Appointments</h5>
<h3 className='text-[20px] font-bold'>10</h3>
</div>
</div>
        </div>
    </div>
  )
}

export default TotalNumbers